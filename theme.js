(function(){
  var THEMES = ["tokyonight", "gruvbox", "dracula", "nord", "matrix", "amber", "pokemon", "salesforce", "win98"];
  var inFrame = false; try { inFrame = window.self !== window.top; } catch(e){ inFrame = true; }
  var sel = document.getElementById('theme-select');
  if(!sel && !inFrame){
    sel = document.createElement('select'); sel.id = 'jones-theme-switch'; sel.setAttribute('aria-label','Theme');
    for(var i=0;i<THEMES.length;i++){ var o=document.createElement('option'); o.value=THEMES[i]; o.textContent=THEMES[i]; sel.appendChild(o); }
    (document.body||document.documentElement).appendChild(sel);
  }
  function setTheme(n){ if(THEMES.indexOf(n)<0) return; document.documentElement.setAttribute('data-theme', n); if(sel && sel.value!==n) sel.value = n; }
  function pick(n){ setTheme(n); try{localStorage.setItem('jones-theme', n);}catch(e){} }
  if(sel) sel.addEventListener('change', function(){ pick(sel.value); });
  try{ var s = localStorage.getItem('jones-theme'); if(s) setTheme(s); }catch(e){}
  window.addEventListener('storage', function(e){ if(e.key === 'jones-theme' && e.newValue) setTheme(e.newValue); });
})();
