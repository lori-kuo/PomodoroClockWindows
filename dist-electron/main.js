"use strict";const{app:t,BrowserWindow:r}=require("electron"),a=require("path"),l=process.env.NODE_ENV==="development";l&&(process.env.VITE_DEV_SERVER_URL="http://localhost:5173");let e=null;function i(){e||(e=new r({width:800,height:600,center:!0,resizable:!0,autoHideMenuBar:!0,webPreferences:{nodeIntegration:!0,contextIsolation:!1}}),e.on("closed",()=>{e=null}),l?setTimeout(()=>{e&&e.loadURL("http://localhost:5173").catch(()=>{console.log("Failed to load dev server, retrying...")})},2e3):e.loadFile(a.join(__dirname,"../dist/index.html")).catch(o=>{console.error("Failed to load app:",o)}),e.webContents.on("before-input-event",(o,n)=>{n.control&&n.key.toLowerCase()==="i"&&o.preventDefault()}))}t.whenReady().then(()=>{i(),t.on("activate",function(){r.getAllWindows().length===0&&i()})});t.on("window-all-closed",function(){process.platform!=="darwin"&&t.quit()});
