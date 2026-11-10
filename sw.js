const V='viaje-v5';
self.addEventListener('install',e=>{ self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(u.origin!==location.origin) return;
  const isPage = r.mode==='navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/');
  e.respondWith(caches.open(V).then(async c=>{
    if(isPage){
      // Páginas: primero red (siempre la última versión); sin conexión, la guardada.
      try{ const res=await fetch(r); if(res&&res.ok) c.put(r,res.clone()); return res; }
      catch(err){ return (await c.match(r,{ignoreSearch:true})) || (await c.match('./index.html',{ignoreSearch:true})) || Response.error(); }
    }
    const hit=await c.match(r);
    const net=fetch(r).then(res=>{ if(res&&res.ok) c.put(r,res.clone()); return res; }).catch(()=>hit);
    return hit||net;
  }));
});
