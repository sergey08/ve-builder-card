import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readingFreshness,freshnessText} from '../src/core.js';
const now=Date.parse('2026-10-27T10:00:00Z');
const opts={enabled:true,max_age_minutes:60,timestamp_entity:'sensor.reading_time'};
test('freshness uses actual timestamp value rather than HA state metadata',()=>{
 const states={'sensor.reading_time':{state:'2026-10-27T08:00:00Z',last_updated:'2026-10-27T10:00:00Z'}};
 const result=readingFreshness(opts,states,[],now);assert.equal(result.status,'stale');assert.equal(result.ageMinutes,120);assert.match(freshnessText(result,'es'),/Datos antiguos.*hace 2 h/);assert.match(freshnessText(result,'en'),/Old data.*2 h ago/);
 assert.equal(readingFreshness(opts,{'sensor.reading_time':{state:(now-60000)/1000}},[],now).status,'fresh');
 assert.equal(readingFreshness(opts,{'sensor.reading_time':{state:now-60000}},[],now).status,'fresh');
});
test('unknown and future timestamps do not become fresh; thresholds include boundary',()=>{
 for(const state of [undefined,'','unknown','unavailable','nonsense','0','2026-10-27T12:00:00Z'])assert.equal(readingFreshness(opts,{'sensor.reading_time':{state}},[],now).status,'unknown');
 assert.equal(readingFreshness(opts,{'sensor.reading_time':{state:'2026-10-27T09:00:00Z'}},[],now).status,'stale');
 assert.equal(readingFreshness({}, {}, [], now).status,'disabled');
});
test('fallback reports oldest state change honestly and missing metadata remains unknown',()=>{
 const result=readingFreshness({enabled:true},{'sensor.a':{last_updated:'2026-10-27T08:00:00Z'},'sensor.b':{last_updated:'2026-10-27T09:59:00Z'}},['sensor.a','sensor.b'],now);
 assert.equal(result.status,'stale');assert.equal(result.source,'changes');assert.match(freshnessText(result,'es'),/Cambio más antiguo/);
 assert.equal(readingFreshness({enabled:true},{},['sensor.a'],now).status,'unknown');
 assert.equal(readingFreshness({enabled:true},{},[],now).status,'unknown');
});
