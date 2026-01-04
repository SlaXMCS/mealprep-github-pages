const gerarMenusButton = document.getElementById('gerarMenus');
const menusContainer = document.getElementById('menusContainer');
const comprasContainer = document.getElementById('comprasContainer');
const iaButton = document.getElementById('iaButton');
const iaPergunta = document.getElementById('iaPergunta');
const iaResposta = document.getElementById('iaResposta');
const filterButtons = document.querySelectorAll('.filter-btn');

const receitasBase = {
  frango: [
    {nome:"Frango Salteado com Arroz", ingredientes:["Frango:200g","Arroz:100g","Cenoura:1","Courgette:1/2","Pimento:1/2"], passos:["Cozer arroz","Saltear frango","Saltear legumes","Misturar tudo","Servir"]},
    {nome:"Frango Assado com Batata", ingredientes:["Frango:200g","Batata:150g","Alho:2","Azeite:1c.sopa"], passos:["Temperar frango","Assar com batata","Servir"]}
  ],
  porco: [
    {nome:"Lombo de Porco Grelhado", ingredientes:["Porco:200g","Arroz:100g","Brócolos:100g"], passos:["Temperar lombo","Grelhar lombo","Cozinhar arroz","Saltear brócolos","Servir"]}
  ],
  vaca: [
    {nome:"Carne de Vaca com Legumes", ingredientes:["Vaca:200g","Arroz:100g","Cenoura:1","Pimento:1"], passos:["Saltear carne","Cozinhar arroz","Saltear legumes","Servir"]}
  ],
  ovos: [
    {nome:"Omelete de Legumes", ingredientes:["Ovos:3","Cebola:1/2","Pimento:1/2","Courgette:1/2"], passos:["Bater ovos","Saltear legumes","Fritar omelete","Servir"]}
  ],
  leguminosas: [
    {nome:"Grão com Legumes", ingredientes:["Grão:150g","Cenoura:1","Couve:50g","Azeite:1c.sopa"], passos:["Cozinhar grão","Saltear legumes","Misturar","Servir"]}
  ]
};

let menusGerados = [];

function gerarMenus(){
  const proteinaEscolhida = document.getElementById('proteina').value;
  const evitar = document.getElementById('evitar').value.toLowerCase().split(',').map(i=>i.trim()).filter(i=>i);

  menusContainer.innerHTML = '';
  comprasContainer.innerHTML = '';

  const proteinasDisponiveis = Object.keys(receitasBase).filter(p => !evitar.includes(p));
  if(proteinasDisponiveis.length === 0){
    menusContainer.innerHTML = "<p class='text-red-600 font-bold'>Erro: todas as proteínas estão a ser evitadas!</p>";
    return;
  }

  const menus = [];
  const compras = {};

  for(let dia=1; dia<=6; dia++){
    const proteinaDia = proteinasDisponiveis[(dia-1)%proteinasDisponiveis.length];
    const listaReceitas = receitasBase[proteinaDia];
    if(!listaReceitas || listaReceitas.length===0) continue;

    const receita = listaReceitas[Math.floor(Math.random()*listaReceitas.length)];
    menus.push({dia, proteina:proteinaDia, receita});
    menusGerados.push({dia, proteina:proteinaDia, receita, done:false});

    receita.ingredientes.forEach(ing=>{
      const [nome, quant] = ing.split(':');
      if(!nome) return;
      if(!compras[nome]) compras[nome]=quant;
    });
  }

  menus.forEach(menu=>{
    const card = document.createElement('div');
    card.classList.add('menu-card');
    card.innerHTML = `<h3 class="font-bold text-lg mb-2">Dia ${menu.dia}: ${menu.receita.nome}</h3>
                      <strong>Proteína:</strong> ${menu.proteina}<br>
                      <strong>Ingredientes:</strong><pre>${menu.receita.ingredientes.join('\n')}</pre>
                      <strong>Passos:</strong><pre>${menu.receita.passos.map((p,i)=>`${i+1}. ${p}`).join('\n')}</pre>`;
    card.addEventListener('click', ()=>{
      menu.done = !menu.done;
      card.classList.toggle('done');
    });
    menusContainer.appendChild(card);
  });

  comprasContainer.innerHTML = `<h2 class="text-2xl font-semibold mb-2">Lista de Compras</h2><pre>${Object.entries(compras).map(([i,q])=>`${i}: ${q}`).join('\n')}</pre>`;
}

// Assistente / Calculadora de proporções
function perguntarIA(){
  const input = iaPergunta.value.toLowerCase().trim();
  let resposta = "Não entendi. Tenta 'dobrar receita' ou 'para 3 pessoas'.";

  const match = input.match(/(\d+)\s*(porções|pessoas)/);
  if(match){
    const fator = parseInt(match[1]);
    if(!menusGerados.length){
      resposta = "Primeiro gera os menus para ajustar a receita!";
    } else {
      const receita = menusGerados[0].receita;
      const ingAjustados = receita.ingredientes.map(ing=>{
        const [nome, quant] = ing.split(':');
        let valor = parseFloat(quant);
        if(isNaN(valor)) return ing;
        let unidade = quant.replace(/[0-9.]/g,'');
        valor = valor*fator;
        return `${nome}: ${valor}${unidade}`;
      });
      resposta = `Receita ajustada para ${fator} porções:\n` + ingAjustados.join('\n');
    }
  } else if(input.includes("dobrar")){
    if(!menusGerados.length){
      resposta = "Primeiro gera os menus!";
    } else {
      const receita = menusGerados[0].receita;
      const ingAjustados = receita.ingredientes.map(ing=>{
        const [nome, quant] = ing.split(':');
        let valor = parseFloat(quant);
        if(isNaN(valor)) return ing;
        let unidade = quant.replace(/[0-9.]/g,'');
        valor*=2;
        return `${nome}: ${valor}${unidade}`;
      });
      resposta = `Receita dobrada:\n` + ingAjustados.join('\n');
    }
  }

  iaResposta.textContent = resposta;
}

// Event listeners
gerarMenusButton.addEventListener('click', gerarMenus);
iaButton.addEventListener('click', perguntarIA);
filterButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filtro = btn.dataset.proteina;
    const filtrados = filtro==='todas'?menusGerados:menusGerados.filter(m=>m.proteina===filtro);
    menusContainer.innerHTML = '';
    filtrados.forEach(menu=>{
      const card = document.createElement('div');
      card.classList.add('menu-card');
      if(menu.done) card.classList.add('done');
      card.innerHTML = `<h3 class="font-bold text-lg mb-2">Dia ${menu.dia}: ${menu.receita.nome}</h3>
                        <strong>Proteína:</strong> ${menu.proteina}<br>
                        <strong>Ingredientes:</strong><pre>${menu.receita.ingredientes.join('\n')}</pre>
                        <strong>Passos:</strong><pre>${menu.receita.passos.map((p,i)=>`${i+1}. ${p}`).join('\n')}</pre>`;
      menusContainer.appendChild(card);
    });
  });
});
