import {clone,normalize,TYPES,uid,VERSION} from './core.js';

export const TRANSFER_LIMIT=512*1024;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const fail=message=>{throw Error(message);};

// Files contain configuration only: no state snapshots or service execution.
export function exportCard(config,{includeEntities=true}={}) {
 const card=clone(config);
 if(!includeEntities){
  const clear=value=>{if(!object(value)&&!Array.isArray(value))return;for(const [key,item]of Object.entries(value)){if(key==='entity'||key.endsWith('_entity'))value[key]='';else if(key==='positions'&&object(item))for(const position of Object.keys(item))item[position]='';else clear(item);}};
  clear(card);
 }
 return JSON.stringify({format:'ve-builder-card',schema_version:1,card_version:VERSION,card},null,2);
}

export function inspectCardImport(source,states={}) {
 if(typeof source!=='string'||new TextEncoder().encode(source).byteLength>TRANSFER_LIMIT)fail('El archivo supera el límite de 512 KB.');
 let data;try{data=JSON.parse(source);}catch{fail('El texto no es un archivo JSON válido.');}
 const safe=(value,depth=0)=>{if(depth>30)fail('La configuración tiene demasiados niveles.');if(value&&typeof value==='object')for(const [key,item]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))fail('El archivo contiene claves no admitidas.');safe(item,depth+1);}};safe(data);
 if(!object(data))fail('El archivo no contiene una tarjeta VE Builder Card.');
 let card=data;
 if('format' in data){if(data.format!=='ve-builder-card')fail('El archivo no contiene una tarjeta VE Builder Card.');if(data.schema_version!==1)fail('La versión del archivo no es compatible.');card=data.card;}
 if(!object(card)||(card.type!==undefined&&card.type!=='custom:ve-builder-card')||!Array.isArray(card.blocks))fail('El archivo no contiene una tarjeta VE Builder Card.');
 if(card.version!==undefined&&card.version!==1)fail('La versión del archivo no es compatible.');
 if(card.blocks.length>100)fail('La tarjeta admite hasta 100 apartados por importación.');
 const checkObject=value=>{if(!object(value))fail('La estructura de la tarjeta no es válida.');};
 const textKeys=['title','name','entity','image','icon','note','language','gear_name'];
 const checkTexts=value=>{for(const [key,item]of Object.entries(value))if((textKeys.includes(key)||key.endsWith('_entity'))&&typeof item!=='string')fail('La estructura de la tarjeta no es válida.');};
 const list=(value,visit)=>{if(value===undefined)return;if(!Array.isArray(value)||value.length>1000)fail('La estructura de la tarjeta no es válida.');value.forEach(item=>{checkObject(item);checkTexts(item);visit?.(item);});};
 checkTexts(card);
 for(const block of card.blocks){
  checkObject(block);checkTexts(block);if(!Object.hasOwn(TYPES,block.type))fail('El archivo contiene un tipo de apartado no compatible.');
  list(block.fields);list(block.prices);list(block.groups,g=>list(g.fields));
  for(const key of ['freshness','pressure_advice','pressure_colors','pressure_colors_front','pressure_colors_rear'])if(block[key]!==undefined){checkObject(block[key]);checkTexts(block[key]);}
  if(block.positions!==undefined){checkObject(block.positions);if(Object.values(block.positions).some(v=>typeof v!=='string'))fail('La estructura de la tarjeta no es válida.');}
  if(block.body_parts!==undefined){checkObject(block.body_parts);Object.values(block.body_parts).forEach(part=>{checkObject(part);checkTexts(part);});}
 }
 // New IDs make every imported section independent, including repeated imports.
 card=clone(card);const fresh=item=>{item.id=uid();};
 for(const block of card.blocks){fresh(block);block.fields?.forEach(fresh);block.prices?.forEach(fresh);block.groups?.forEach(group=>{fresh(group);group.fields?.forEach(fresh);});}
 const config=normalize(card),entities=new Set();
 const collect=(value,key='')=>{if(!value||typeof value!=='object')return;for(const [name,item]of Object.entries(value)){if(typeof item==='string'&&(name==='entity'||name.endsWith('_entity')||key==='positions')&&item)entities.add(item);else collect(item,name);}};collect(config);
 const missing=[...entities].filter(id=>!states[id]);
 const fields=config.blocks.reduce((n,b)=>n+(b.fields?.length??0)+(b.prices?.length??0)+(b.groups??[]).reduce((sum,g)=>sum+(g.fields?.length??0),0),0);
 return {config,blocks:config.blocks.length,fields,entities:[...entities],missing};
}
