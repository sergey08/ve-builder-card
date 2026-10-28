import {number} from './core.js';

const known=value=>value!==undefined&&value!==null&&!['unknown','unavailable','none','null',''].includes(String(value).toLowerCase());
export function vehicleRain(options={},states={},now=Date.now()){
 const off=reason=>({active:false,reason});
 if(!options.enabled)return off('disabled');
 const intensity=['light','normal','heavy'].includes(options.intensity)?options.intensity:'normal';
 if(options.preview)return {active:true,intensity,animated:options.animate!==false,preview:true};
 if(options.covered)return off('covered');
 if(options.home_only){const location=states[options.location_entity]?.state;if(!known(location)||location!==String(options.home_value??'home'))return off('location');}
 if(options.covered_entity){const value=states[options.covered_entity]?.state;if(!known(value)||value===String(options.covered_value??'on'))return off('covered');if(value!==String(options.uncovered_value??'off'))return off('unknown-cover');}
 const state=states[options.entity];if(!known(state?.state))return off('unknown');
 const stamp=Date.parse(state.last_reported??state.last_updated),age=now-stamp,max=number(options.max_age_minutes)??180;
 if(!Number.isFinite(age)||age < -120000||age>Math.max(1,max)*60000)return off('stale');
 const domain=String(options.entity??'').split('.')[0];let raining=false;
 if((options.source??'weather')==='weather'&&domain==='weather')raining=['rainy','pouring','lightning-rainy','snowy-rainy'].includes(state.state);
 else if(options.source==='binary'&&['binary_sensor','input_boolean'].includes(domain))raining=state.state===String(options.rain_value??'on');
 else if(options.source==='numeric'&&['sensor','number','input_number'].includes(domain)){const value=number(state.state),threshold=number(options.threshold)??0;raining=value!==null&&value>Math.max(0,threshold);}
 return raining?{active:true,intensity,animated:options.animate!==false,preview:false}:off('dry');
}

export const rainStyles=`
.rain-host{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;border-radius:12px}
.rain-overlay{display:block;width:100%;height:100%;color:#729bbb;opacity:.85;--rain-tempo:1;mask-image:linear-gradient(to bottom,transparent,#000 12%,#000 87%,transparent);-webkit-mask-image:linear-gradient(to bottom,transparent,#000 12%,#000 87%,transparent)}
.rain-drops{stroke:currentColor;stroke-linecap:round;fill:none}
.rain-depth-far{stroke-width:.8;opacity:.35;--rain-speed:1.9s;--rain-phase:-1.2s}
.rain-depth-mid{stroke-width:1.2;opacity:.58;--rain-speed:1.25s;--rain-phase:-.45s}
.rain-depth-near{stroke-width:1.7;opacity:.8;--rain-speed:.85s;--rain-phase:-.7s}
.rain-animated .rain-drops{animation:ve-rain-fall calc(var(--rain-speed) * var(--rain-tempo)) linear infinite;animation-delay:var(--rain-phase)}
.rain-light{opacity:.65;--rain-tempo:1.25}.rain-heavy{opacity:1;--rain-tempo:.8}
.rain-preview-label{position:absolute;left:8px;bottom:8px;padding:4px 7px;border-radius:8px;background:var(--card-background-color);color:var(--secondary-text-color);font-size:10px;z-index:4;pointer-events:none}
@keyframes ve-rain-fall{from{transform:translateY(-230px)}to{transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.rain-animated .rain-drops{animation:none}}
`;
