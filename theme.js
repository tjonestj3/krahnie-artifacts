(function(){
  var THEMES = ["tokyonight", "gruvbox", "dracula", "nord", "matrix", "amber", "pokemon", "salesforce", "win98"];
  var sel = document.getElementById('theme-select');
  if(!sel){
    sel = document.createElement('select'); sel.id = 'jones-theme-switch'; sel.setAttribute('aria-label','Theme');
    for(var i=0;i<THEMES.length;i++){ var o=document.createElement('option'); o.value=THEMES[i]; o.textContent=THEMES[i]; sel.appendChild(o); }
    (document.body||document.documentElement).appendChild(sel);
  }
  function applyTheme(n){ if(THEMES.indexOf(n)<0) return; document.documentElement.setAttribute('data-theme', n); try{localStorage.setItem('jones-theme', n);}catch(e){} if(sel.value!==n) sel.value=n; }
  sel.addEventListener('change', function(){ applyTheme(sel.value); });
  try{ var s = localStorage.getItem('jones-theme'); if(s && THEMES.indexOf(s)>=0){ document.documentElement.setAttribute('data-theme', s); sel.value = s; } }catch(e){}
})();
