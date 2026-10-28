import {uid} from './core.js';
import {translate} from './i18n.js';

export const STATUS_TYPES={lock:'Cerradura',doors:'Puertas',windows:'Ventanillas'};
const STATUS_PROFILES={
 lock:{normal:'Bloqueado',attention:'Desbloqueado',icon:'mdi:lock',attention_icon:'mdi:lock-open-variant'},
 doors:{normal:'Puertas cerradas',attention:'Puertas abiertas',icon:'mdi:car-door',attention_icon:'mdi:car-door'},
 windows:{normal:'Ventanillas cerradas',attention:'Ventanillas abiertas',icon:'mdi:window-closed-variant',attention_icon:'mdi:window-open-variant'}
};
export function newVehicleStatus(kind='lock'){return {id:uid(),kind:Object.hasOwn(STATUS_TYPES,kind)?kind:'lock',entity:''};}
export function vehicleStatusValues(item){const domain=String(item.entity??'').split('.')[0];return {normal_value:item.normal_value??(domain==='cover'?'closed':item.kind==='lock'&&domain==='lock'?'locked':'off'),attention_value:item.attention_value??(domain==='cover'?'open':item.kind==='lock'&&domain==='lock'?'unlocked':'on')};}
export function vehicleStatus(item,states={},lang='es'){
 const profile=STATUS_PROFILES[item.kind]??STATUS_PROFILES.doors,state=states[item.entity]?.state,{normal_value,attention_value}=vehicleStatusValues(item);
 let level='unknown',label=translate('Sin datos',lang),icon=item.icon||profile.icon;
 if(state!==undefined&&state!==null&&!['unknown','unavailable','none','null',''].includes(String(state).toLowerCase())){
  if(String(state)===String(normal_value)&&normal_value!==attention_value){level='normal';label=item.normal_text||translate(profile.normal,lang);}
  else if(String(state)===String(attention_value)&&normal_value!==attention_value){level='attention';label=item.attention_text||translate(profile.attention,lang);icon=item.icon||profile.attention_icon;}
 }
 return {level,label,icon,name:item.name||'',entity:item.entity||''};
}
export const vehicleStatusStyles=`.vehicle-statuses{display:flex;justify-content:center;flex-wrap:wrap;gap:4px 14px;padding:4px 16px 0}.vehicle-statuses .vehicle-status{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:28px;max-width:100%;padding:2px 0;border:0;border-radius:0;background:transparent;font:inherit;font-size:11px;color:var(--secondary-text-color);line-height:1.4}.vehicle-status span{margin:0;overflow-wrap:anywhere;color:inherit}.vehicle-status ha-icon{--mdc-icon-size:15px;flex-shrink:0}.vehicle-status.status-attention{color:var(--warning-color,#ff9800)}.vehicle-status.status-unknown{opacity:.65}.vehicle-status:disabled{cursor:default}.vehicle-status:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}`;
