const gerarMenusButton = document.getElementById('gerarMenus');
const menusContainer = document.getElementById('menusContainer');
const comprasContainer = document.getElementById('comprasContainer');
const iaButton = document.getElementById('iaButton');
const iaPergunta = document.getElementById('iaPergunta');
const iaResposta = document.getElementById('iaResposta');

// Base de receitas offline
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

function gerarMenus() {
  const proteinaInicial = document.getElementById('proteina').value;
  const evitar = document.getElementById('evitar').value.split(',').map(i=>i.trim().toLowerCase());
  menusContainer.innerHTML = '';
  comprasContainer.innerHTML = '';

  const menus = [];
  const compras = {};

  for(let dia=1; dia<=6; dia++){
    const proteinasDisponiveis = Object.keys(receitasBase).filter(p => !evitar.includes(p));
    const proteinaDia = proteinasDisponiveis[(dia-1) % proteinasDisponiveis.length];
    const receitaLista = receitasBase[proteinaDia];
    const receita = receitaLista[Math.floor(Math.random()*receitaLista.length)];

    menus.push({dia, receita});

    // Lista de compras agregada
    receita.ingredientes.forEach(ing => {
      const [nome, quant] = ing.split(':');
      if(!compras[nome]) compras[nome] = quant;
    });
  }

  // Mostrar menus em cards
  menus.forEach(menu=>{
    const card = document.createElement('div');
    card.classList.add('menu-card');

    card.innerHTML = `<h3 class="font-bold text-lg mb-2">Dia ${menu.dia}: ${menu.receita.nome}</h3>
                      <strong>Ingredientes:</strong>
                      <pre>${menu.receita.ingredientes.join('\n')}</pre>
                      <strong>Passos:</strong>
                      <pre>${menu.receita.passos.map((p,i)=>`${i+1}. ${p}`).join('\n')}</pre>`;
    menusContainer.appendChild(card);
  });

  // Mostrar lista de compras
  comprasContainer.innerHTML = `<h2 class="text-2xl font-semibold mb-2">Lista de Compras Agregada</h2><pre>${Object.entries(compras).map(([i,q])=>`${i}: ${q}`).join('\n')}</pre>`;
}

// Assistente Offline avançado
function perguntarIA() {
  const pergunta = iaPergunta.value.toLowerCase();
  if(!pergunta) return;

  let resposta = "Desculpa, não sei responder a isso. Sugiro ajustar os ingredientes conforme preferência.";

  const palavrasChave = ["substituir", "alternativa", "trocar"];
  const conservacao = ["conservação", "guardar", "armazenamento"];
  const tempo = ["tempo", "preparação", "duração"];

  if(palavrasChave.some(p=>pergunta.includes(p))){
    resposta = "Para substituir proteínas, pode usar frango, porco, vaca, ovos ou leguminosas, dependendo da receita.";
  } else if(conservacao.some(p=>pergunta.includes(p))){
    resposta = "As refeições podem ser guardadas no frigorífico até 3 dias e aquecidas no micro-ondas antes de consumir.";
  } else if(tempo.some(p=>pergunta.includes(p))){
    resposta = "A preparação média de cada receita é entre 20 a 40 minutos, dependendo da proteína.";

  }

  iaResposta.textContent = resposta;
}

gerarMenusButton.addEventListener('click', gerarMenus);
iaButton.addEventListener('click', perguntarIA);
