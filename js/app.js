let receitas = {};
let menusGerados = [];
let modoCozinhaAtivo = false;

// Carregar receitas
fetch('data/recipes.json')
  .then(r=>r.json())
  .then(data=>{ receitas = data; carregarLocalStorage(); });

const menusContainer = document.getElementById('menusContainer');
const comprasContainer = document.getElementById('comprasContainer');
const iaPergunta = document.getElementById('iaPergunta');
const iaResposta = document.getElementById('iaResposta');

const gerarMenusButton = document.getElementById('gerarMenus');
const iaButton = document.getElementById('iaButton');
const modoCozinhaBtn = document.getElementById('modoCozinha');

function salvarLocalStorage(){
  localStorage.setItem('menusGerados', JSON.stringify(menusGerados));
}

function carregarLocalStorage(){
  const saved = localStorage.getItem('menusGerados');
  if(saved) menusGerados = JSON.parse(saved);
  renderMenus();
  calcularCompras();
}

function gerarMenus(){
  const proteinaFav = document.getElementById('proteina').value;
  const evitar = document.getElementById('evitar').value.toLowerCase().split(',').map(i=>i.trim()).filter(i=>i);
  const porcoes = parseInt(document.getElementById('porcoes').value)||1;
  const filtro = document.getElementById('filtro').value;

  menusContainer.innerHTML='';
  comprasContainer.innerHTML='';
  menusGerados=[];

  const proteinasDisponiveis = Object.keys(receitas).filter(p=>!evitar.includes(p));
  if(proteinasDisponiveis.length===0){
    menusContainer.innerHTML="<p class='text-red-600 font-bold'>Erro: todas as proteínas estão a ser evitadas!</p>";
    return;
  }

  let usedReceitas = {};

  for(let dia=1; dia<=6; dia++){
    let proteinaDia = dia===1?proteinaFav:proteinasDisponiveis[(dia-1)%proteinasDisponiveis.length];
    let lista = receitas[proteinaDia].filter(r=>!usedReceitas[r.nome]);
    if(filtro!=='todos') lista = lista.filter(r=>r.tags && r.tags.includes(filtro));
    if(lista.length===0) continue;
    const receita = lista[Math.floor(Math.random()*lista.length)];
    usedReceitas[receita.nome]=true;
    menusGerados.push({dia, proteina:proteinaDia, receita, done:false, porcoes});
  }

  renderMenus();
  calcularCompras();
  salvarLocalStorage();
}

function renderMenus(){
  menusContainer.innerHTML='';
  menusGerados.forEach((menu,index)=>{
    const card = document.createElement('div');
    card.classList.add('menu-card');
    card.draggable=true;
    card.dataset.index=index;

    const tags = menu.receita.tags?menu.receita.tags.map(t=>`<span class="badge">${t}</span>`).join(' '):'';
    card.innerHTML = `<h3 class="font-bold text-lg mb-2">${tags} Dia ${menu.dia}: ${menu.receita.nome}</h3>
                      <strong>Proteína:</strong> ${menu.proteina}<br>
                      <strong>Ingredientes:</strong><pre>${menu.receita.ingredientes.map(i=>{
                        let [nome, quant]=i.split(':'); return `${nome}: ${quant*menu.porcoes}`;
                      }).join('\n')}</pre>
                      <strong>Passos:</strong><pre>${menu.receita.passos.map((p,i)=>`${i+1}. ${p}`).join('\n')}</pre>`;

    card.addEventListener('click', ()=>{
      menu.done=!menu.done;
      card.classList.toggle('done');
      salvarLocalStorage();
    });

    // Drag & Drop
    card.addEventListener('dragstart', e=>e.dataTransfer.setData('text/plain', index));
    card.addEventListener('dragover', e=>e.preventDefault());
    card.addEventListener('drop', e=>{
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain');
      const to = index;
      [menusGerados[from], menusGerados[to]] = [menusGerados[to], menusGerados[from]];
      renderMenus();
      salvarLocalStorage();
    });

    if(modoCozinhaAtivo){
      card.querySelector('pre:nth-of-type(2)').style.display='none';
      card.querySelector('h3').style.fontSize='2xl';
    }
    menusContainer.appendChild(card);
  });
}

function calcularCompras(){
  const compras={};
  menusGerados.forEach(m=>m.receita.ingredientes.forEach(i=>{
    let [nome, quant]=i.split(':'); if(!nome) return;
    let valor=parseFloat(quant)*m.porcoes;
    if(compras[nome]) compras[nome]+=valor;
    else compras[nome]=valor;
  }));
  comprasContainer.innerHTML=`<h2 class="text-2xl font-semibold mb-2">Lista de Compras</h2><pre>${Object.entries(compras).map(([i,q])=>`${i}: ${q}`).join('\n')}</pre>`;
}

// Assistente offline
function perguntarIA(){
  const input = iaPergunta.value.toLowerCase().trim();
  let resposta="Não entendi. Tenta 'dobrar receita' ou 'para 3 pessoas'.";
  const match = input.match(/(\d+)\s*(porções|pessoas)/);
  if(match){
    const fator = parseInt(match[1]);
    if(!menusGerados.length){ resposta="Primeiro gera os menus!"; }
    else{
      const receita = menusGerados[0].receita;
      const ing = receita.ingredientes.map(i=>{
        const [nome, quant]=i.split(':');
        let v=parseFloat(quant); if(isNaN(v)) return i;
        let unidade=quant.replace(/[0-9.]/g,''); v*=fator;
        return `${nome}: ${v}${unidade}`;
      });
      resposta=`Receita ajustada para ${fator} porções:\n`+ing.join('\n');
    }
  } else if(input.includes("dobrar")){
    if(!menusGerados.length){ resposta="Primeiro gera os menus!"; }
    else{
      const receita = menusGerados[0].receita;
      const ing = receita.ingredientes.map(i=>{
        const [nome, quant]=i.split(':');
        let v=parseFloat(quant); if(isNaN(v)) return i;
        let unidade=quant.replace(/[0-9.]/g,''); v*=2;
        return `${nome}: ${v}${unidade}`;
      });
      resposta="Receita dobrada:\n"+ing.join('\n');
    }
  }
  iaResposta.textContent=resposta;
}

modoCozinhaBtn.addEventListener('click', ()=>{
  modoCozinhaAtivo = !modoCozinhaAtivo;
  renderMenus();
});

gerarMenusButton.addEventListener('click', gerarMenus);
iaButton.addEventListener('click', perguntarIA);
