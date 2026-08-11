/* 元器件库存管理 - 本地中转服务(零依赖,Node 原生模块)
 * 作用:① 静态文件服务(用 http://127.0.0.1:8899 打开本应用)
 *       ② /proxy 转发接口:由本服务(服务端,无浏览器 CORS 限制)直连立创商城,
 *          前端「在线匹配 / 导入自动类别」优先走此通道,不再依赖公共代理。
 * 启动:node server.js   (macOS 也可双击「启动库存管理.command」)
 */
const http=require('http');
const https=require('https');
const fs=require('fs');
const path=require('path');

const PORT=8899;
const CWD=process.cwd();
const MIME={
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css','.json':'application/json; charset=utf-8','.svg':'image/svg+xml',
  '.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp',
  '.xls':'application/vnd.ms-excel','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv':'text/csv; charset=utf-8','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'
};
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function proxy(target,res){
  let mod,t;
  try{t=new URL(target)}catch(e){res.writeHead(400,{'Access-Control-Allow-Origin':'*'});res.end('bad url');return}
  mod=t.protocol==='https:'?https:http;
  const req=mod.get(t,{headers:{'User-Agent':UA,'Referer':t.origin+'/','Accept':'text/html,application/xhtml+xml,application/json,*/*'}},r=>{
    res.writeHead(r.statusCode||200,{
      'Access-Control-Allow-Origin':'*',
      'Content-Type':r.headers['content-type']||'text/html; charset=utf-8'
    });
    r.pipe(res);
  });
  req.on('error',e=>{
    res.writeHead(502,{'Access-Control-Allow-Origin':'*','Content-Type':'text/plain; charset=utf-8'});
    res.end('proxy error: '+e.message);
  });
  req.setTimeout(20000,()=>req.destroy(new Error('timeout')));
}

const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1:'+PORT);
  if(u.pathname==='/proxy'){
    const target=u.searchParams.get('url');
    if(!target){res.writeHead(400,{'Access-Control-Allow-Origin':'*'});res.end('missing url');return}
    proxy(target,res);
    return;
  }
  /* 静态文件服务 */
  let p=decodeURIComponent(u.pathname);
  if(p==='/')p='/index.html';
  const file=path.normalize(path.join(CWD,p));
  if(!file.startsWith(CWD)){res.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});res.end('forbidden');return}
  fs.readFile(file,(e,buf)=>{
    if(e){
      if(p==='/index.html'&&fs.existsSync(path.join(CWD,'元器件库存管理.html'))){
        fs.readFile(path.join(CWD,'元器件库存管理.html'),(e2,b2)=>{
          if(e2){res.writeHead(404);res.end('not found');return}
          res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(b2);
        });
        return;
      }
      res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('not found');
      return;
    }
    res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream'});
    res.end(buf);
  });
});

server.on('error',e=>{
  if(e.code==='EADDRINUSE'){
    console.log('');
    console.log('端口 '+PORT+' 已被占用:本地服务可能已在运行。');
    console.log('请直接打开: http://127.0.0.1:'+PORT+'/元器件库存管理.html');
    process.exit(0);
  }
  throw e;
});
server.listen(PORT,'127.0.0.1',()=>{
  console.log('');
  console.log('==============================================');
  console.log('  元器件库存管理 本地服务已启动');
  console.log('  请在浏览器打开: http://127.0.0.1:'+PORT+'/元器件库存管理.html');
  console.log('  (按 Ctrl+C 停止服务)');
  console.log('==============================================');
});
