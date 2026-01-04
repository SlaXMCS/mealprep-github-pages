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
    {nome:"Frango Assado com Batata", ingredientes:["Frango:200g","Batata:150g","Alho:2 dentes","Azeite:1c.sopa"], passos:["Temperar frango","Assar com batata","Servir"]}
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

function gerarMenus() {
  const proteinaInicial = document.getElementById('proteina').value;
  const evitar = document.getElementById('evitar').value.split(',').map(i=>i.trim().toLowerCase());

  menusContainer.innerHTML = '';
  comprasContainer.innerHTML = '';
  menusGerados = [];

  const menus = [];
  const compras = {};

  for(let dia=1; dia<=6; dia++){
    const proteinasDisponiveis = Object.keys(receitasBase).filter(p => !evitar.includes(p));
    const proteinaDia = proteinasDisponiveis[(dia-1) % proteinasDisponiveis.length];
    const receitaLista = receitasBase[proteinaDia];
    const receita = receitaLista[Math.floor(Math.random()*receitaLista.length)];

    menus.push({dia, proteina: proteinaDia, receita});
    menusGerados.push({dia, proteina: proteinaDia, receita, done:false});

    // Lista de compras
    receita.ingredientes.forEach(ing=>{
      const [nome, quant] = ing.split(':');
      if(!compras[nome]) compras[nome] = quant;
    });
  }

  mostrarMenus(menusGerados);
  comprasContainer.innerHTML = `<h2 class="text-2xl font-semibold mb-2">Lista de Compras Agregada</h2><pre>${Object.entries(compras).map(([i,q])=>`${i}: ${q}`).join('\n')}</pre>`;
}

function mostrarMenus(menus) {
  menusContainer.innerHTML = '';
  menus.forEach((menu, index)=>{
    const card = document.createElement('div');
    card.classList.add('menu-card');
    if(menu.done) card.classList.add('done');
    card.dataset.proteina = menu.proteina;

    card.innerHTML = `<h3 class="font-bold text-lg mb-2">Dia ${menu.dia}: ${menu.receita.nome}</h3>
                      <strong>Proteína:</strong> ${menu.proteina}<br>
                      <strong>Ingredientes:</strong>
                      <pre>${menu.receita.ingredientes.join('\n')}</pre>
                      <strong>Passos:</strong>
                      <pre>${menu.receita.passos.map((p,i)=>`${i+1}. ${p}`).join('\n')}</pre>`;

    card.addEventListener('click', ()=>{
      menusGerados[index].done = !menusGerados[index].done;
      mostrarMenus(menusGerados);
    });

    menusContainer.appendChild(card);
  });
}

// Filtros
filterButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');

    const filtro = btn.dataset.proteina;
    const filtrados = filtro === 'todas' ? menusGerados : menusGerados.filter(m=>m.proteina===filtro);
    mostrarMenus(filtrados);
  });
});

// Assistente offline
function perguntarIA() {
  const pergunta = iaPergunta.value.toLowerCase();
  if(!pergunta) return;

  let resposta = "Desculpa, não sei responder a isso. Sugiro ajustar os ingredientes conforme preferência.";
  if(["substituir","alternativa","trocar"].some(p=>pergunta.includes(p))){
    resposta = "Para substituir proteínas, pode usar frango, porco, vaca, ovos ou leguminosas.";
  } else if(["conservação","guardar","armazenamento"].some(p=>pergunta.includes(p))){
    resposta = "As refeições podem ser guardadas no frigorífico até 3 dias e aquecidas no micro-ondas antes de consumir.";
  } else if(["tempo","preparação","duração"].some(p=>pergunta.includes(p))){
    resposta = "A preparação média de cada receita é entre 20 a 40 minutos, dependendo da proteína.";
  }

  iaResposta.textContent = resposta;
}

gerarMenusButton.addEventListener('click', gerarMenus);
iaButton.addEventListener('click', perguntarIA);
