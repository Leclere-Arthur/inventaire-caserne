/* CCRM CIS Le Chesne — modèle procédural léger, zones issues de Supabase. */
(function(){
'use strict';
let libPromise;
function chargerThree(){
 if(window.THREE)return Promise.resolve(window.THREE);
 if(!libPromise)libPromise=new Promise((ok,ko)=>{
  const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r160/three.min.js';
  s.onload=()=>window.THREE?ok(window.THREE):ko(Error('Three.js indisponible'));
  s.onerror=()=>ko(Error('Chargement Three.js impossible'));document.head.appendChild(s);
 });return libPromise;
}
window.creerModeleCCRM3D=async function(host,zones,controles,ouvrir){
 const T=await chargerThree();if(!host.isConnected)return;
 if(host.__ccrmStop)host.__ccrmStop();host.innerHTML='';
 const scene=new T.Scene();scene.background=new T.Color('#e8eff5');
 const camera=new T.PerspectiveCamera(35,1,.1,100);camera.position.set(10,7,12);camera.lookAt(0,1.6,0);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(host.clientWidth||320,host.clientHeight||310);
 renderer.outputColorSpace=T.SRGBColorSpace;host.appendChild(renderer.domElement);
 scene.add(new T.HemisphereLight(0xffffff,0x647587,2.4));
 const light=new T.DirectionalLight(0xffffff,2.3);light.position.set(5,10,7);scene.add(light);
 const root=new T.Group();scene.add(root);
 const mat=(c,metal=false)=>new T.MeshStandardMaterial({color:c,roughness:metal?.52:.78,metalness:metal?.38:0});
 const red=mat('#c91e27'),redDark=mat('#a91520'),glass=mat('#284758'),yellow=mat('#e7bf26',true),silver=mat('#bdc5ca',true),black=mat('#242b31'),white=mat('#f3f3ed');
 function box(w,h,d,x,y,z,m,parent=root){const a=new T.Mesh(new T.BoxGeometry(w,h,d),m);a.position.set(x,y,z);parent.add(a);return a;}
 function cylinder(r,len,x,y,z,m,axis='z'){const a=new T.Mesh(new T.CylinderGeometry(r,r,len,18),m);a.rotation[axis==='z'?'x':'z']=Math.PI/2;a.position.set(x,y,z);root.add(a);return a;}
 // Axe longitudinal X : cabine à l'avant (+X), arrière (-X).
 box(6.3,.27,2.55,-.1,.75,0,black);box(4.0,2.2,2.5,-1.3,2.0,0,red);
 box(2.15,1.85,2.42,2.0,1.94,0,red);box(1.1,.85,2.44,2.6,1.05,0,red);
 box(.13,.76,2.12,3.075,2.42,0,glass); // pare-brise avant
 for(const side of [-1,1]){
  box(.95,.75,.055,2.15,2.44,side*1.245,glass);
  box(.12,.11,.14,2.82,2.0,side*1.35,black);
  box(.6,.15,.14,2.3,1.55,side*1.31,silver);
  for(const x of [-2.15,2.05]){
   cylinder(.57,.21,x,.69,side*1.26,black);
   cylinder(.3,.225,x,.69,side*1.28,silver);
  }
  box(3.65,.09,.13,-1.3,3.15,side*1.28,silver);
  box(3.6,.15,.13,-1.3,1.04,side*1.27,silver);
 }
 box(4.1,.16,2.55,-1.25,3.19,0,redDark);
 box(.12,.45,1.3,3.16,1.48,0,silver);
 box(.08,.12,.4,3.24,1.88,-.7,white);box(.08,.12,.4,3.24,1.88,.7,white);
 // Échelle sur le toit, visible mais non cliquable.
 for(const z of [-.45,.45])box(3.7,.075,.07,-.85,3.45,z,silver);
 for(let x=-2.5;x<.9;x+=.42)box(.065,.075,1,-0+x+1.65,3.46,0,silver);
 // Dévidoirs arrière, visibles mais non cliquables.
 for(const z of [-.62,.62]){
  const reel=new T.Mesh(new T.TorusGeometry(.38,.085,8,22),yellow);reel.rotation.y=Math.PI/2;reel.position.set(-3.37,1.85,z);root.add(reel);
  box(.18,.12,.14,-3.4,1.85,z,silver);
 }
 box(.07,.15,1.8,-3.4,.93,0,silver);
 const clickable=[];
 const sides={gauche:[],droite:[],bas:[],arriere:[],toit:[],echelle:[],autre:[]};
 for(const zone of zones){
  const s=(zone.nom+' '+(zone.cote||'')).toLocaleLowerCase('fr');
  const roof=/toit|sup[eé]rieur|pavillon/.test(s);
  const ladder=/[eé]chelle|acc[eè]s/.test(s);
  const low=/bas|inf[eé]rieur|soute|marche/.test(s);
  const rear=/arri[eè]re|hayon/.test(s);
  const right=/droit|conducteur/.test(s);
  const left=/gauch|passager/.test(s);
  const key=roof?'toit':ladder?'echelle':rear?'arriere':low?'bas':right?'droite':left?'gauche':(sides.gauche.length<=sides.droite.length?'gauche':'droite');
  sides[key].push(zone);
 }
 function clickableBox(zone,w,h,d,x,y,z){
  const done=Object.prototype.hasOwnProperty.call(controles,zone.id);
  const mesh=box(w,h,d,x,y,z,mat(done?'#26a269':'#3687df',true));
  mesh.userData.zone=zone;clickable.push(mesh);
  const edge=new T.LineSegments(new T.EdgesGeometry(mesh.geometry),new T.LineBasicMaterial({color:done?0x14663f:0x174a91}));edge.position.copy(mesh.position);root.add(edge);
 }
 function sideZones(arr,side,lower){
  arr.forEach((zone,i)=>{
   const width=Math.min(1.7,3.5/Math.max(arr.length,2)-.08);
   const x=-2.85+(i+.5)*(3.5/arr.length);
   clickableBox(zone,width,lower?.39:1.34,.085,x,lower?1.0:2.24,side*1.32);
  });
 }
 sideZones(sides.gauche,-1,false);sideZones(sides.droite,1,false);
 sides.bas.forEach((z,i)=>clickableBox(z,Math.min(1.4,3.6/sides.bas.length-.07),.35,.1,-2.9+(i+.5)*3.6/sides.bas.length,.99,(i%2?1:-1)*1.33));
 sides.echelle.forEach((z,i)=>clickableBox(z,.55,1.48,.1,-2.75+i*.62,2.23,1.34));
 sides.arriere.forEach((z,i)=>clickableBox(z,.085,.72,Math.min(.8,2/sides.arriere.length-.05),-3.39,2.32,-.95+(i+.5)*1.9/sides.arriere.length));
 sides.toit.forEach((z,i)=>clickableBox(z,Math.min(1.2,2.5/sides.toit.length-.07),.15,1.05,-2.6+(i+.5)*2.5/sides.toit.length,3.38,.4));
 const rest=sides.autre;rest.forEach((z,i)=>clickableBox(z,.7,.6,.1,-2.6+i*.75,1.65,-1.34));
 const ground=box(9,.06,5,0,.07,0,mat('#d6dee4'));
 let dragging=false,moved=false,lastX=0,lastY=0,az=.35,elev=.42,dist=13;
 function position(){camera.position.set(Math.cos(az)*Math.cos(elev)*dist,1.7+Math.sin(elev)*dist,Math.sin(az)*Math.cos(elev)*dist);camera.lookAt(0,1.65,0);}
 position();const ray=new T.Raycaster(),pointer=new T.Vector2();
 function down(e){dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);}
 function move(e){if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;az+=dx*.012;elev=Math.max(.08,Math.min(1.25,elev+dy*.007));lastX=e.clientX;lastY=e.clientY;position();render();}
 function up(e){if(!dragging)return;dragging=false;if(moved)return;const r=renderer.domElement.getBoundingClientRect();pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(clickable)[0];if(hit?.object.userData.zone)ouvrir(hit.object.userData.zone.id);}
 function wheel(e){e.preventDefault();dist=Math.max(7,Math.min(21,dist+Math.sign(e.deltaY)*.9));position();render();}
 let pinch=0;
 function touch(e){if(e.touches.length===2){e.preventDefault();const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(pinch)dist=Math.max(7,Math.min(21,dist*pinch/d));pinch=d;position();render();}else pinch=0;}
 const el=renderer.domElement;el.style.touchAction='pan-y';el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>dragging=false);el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('touchmove',touch,{passive:false});el.addEventListener('touchend',()=>pinch=0);
 const resize=new ResizeObserver(()=>{if(!host.isConnected)return;const w=host.clientWidth||320,h=host.clientHeight||310;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);render();});resize.observe(host);
 function render(){renderer.render(scene,camera);}render();
 host.__ccrmStop=()=>{resize.disconnect();renderer.dispose();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});};
};
})();
