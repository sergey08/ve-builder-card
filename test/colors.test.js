import {test} from 'node:test';
import assert from 'node:assert/strict';
import {valueSeverity} from '../src/core.js';
test('low and high colours include boundaries and prioritise critical thresholds',()=>{
 const low={enabled:true,direction:'low',warning:40,critical:20};
 for(const [n,want]of [[80,'normal'],[40,'warning'],[20,'critical'],[0,'critical']])assert.equal(valueSeverity(n,low),want);
 const high={enabled:true,direction:'high',warning:60,critical:80};
 for(const [n,want]of [[0,'normal'],[60,'warning'],[80,'critical'],[100,'critical']])assert.equal(valueSeverity(n,high),want);
 assert.equal(valueSeverity(2.1,{...low,warning:2.3,critical:2.1}),'critical');
});
test('missing data, disabled colours and invalid threshold order retain the original style',()=>{
 for(const n of [null,undefined,'','unavailable','unknown','NaN','<script>'])assert.equal(valueSeverity(n,{enabled:true,direction:'low',warning:40,critical:20}),'');
 assert.equal(valueSeverity(0,{enabled:false,direction:'low',warning:40}),'');
 assert.equal(valueSeverity(10,{enabled:true,direction:'low',warning:20,critical:40}),'');
 assert.equal(valueSeverity(10,{enabled:true,direction:'high',warning:40,critical:20}),'');
 assert.equal(valueSeverity(10,{enabled:true,direction:'other',warning:40}),'');
 assert.equal(valueSeverity(0,{enabled:true,direction:'low',critical:0}),'critical');
 assert.equal(valueSeverity(5,{enabled:true,direction:'high',warning:0}),'warning');
});
