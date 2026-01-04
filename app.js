const gerarMenusButton = document.getElementById('gerarMenus');
const menusContainer = document.getElementById('menusContainer');
const comprasContainer = document.getElementById('comprasContainer');
const iaButton = document.getElementById('iaButton');
const iaPergunta = document.getElementById('iaPergunta');
const iaResposta = document.getElementById('iaResposta');

const openaiAPIKey = "YOUR_OPENAI_KEY"; // substitui pela tua

async function gerarMenus() {
  const proteina = document.getElementById('proteina').value;
  const evitar = document.getElementById('evitar').value.split(',').map(i => i.trim());

  menusContainer.innerHTML = `<p>Gerando menus...</p>`;
  comprasContainer.innerHTML = ``;

  const menus = [];
  const compras = {};

  for(let dia=1; dia<=6; dia++){
    const prompt = `
    Cria uma receita prática para meal prep do dia ${dia}, proteína principal: ${proteina}, evitando: ${evitar.join(', ')}.
    Ingredientes + quantidades + passos simples.
    Apto micro-ondas e frigorífico por 3 dias.
    Formata assim:
    Ingredientes:
    - nome: quantidade
    Passos:
    1. ...
    `;
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiAPIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{role:"user", content: prompt}],
          max_tokens: 500
        })
      });
      const data = await response.json();
      const receita = data.choices[0].message.content;
      menus.push({dia, receita});

      // Extrair lista de compras
      receita.split('\n').forEach(linha=>{
        if(linha.includes(':')){
          const [ingrediente, quant] = linha.split(':');
          if(!compras[ingrediente]) compras[ingrediente] = quant.trim();
        }
      });

    } catch(err){
      console.error(err);
      menus.push({dia, receita: "Erro a gerar receita"});
    }
  }

  // Mostrar menus
  menusContainer.innerHTML = `<h2 class="text-2xl font-semibold mb-2">Menus 6 Dias</h2>`;
  menus.forEach(menu=>{
    const pre = document.createElement('pre');
    pre.textContent = menu.receita;
    menusContainer.appendChild(pre);
  });

  // Mostrar lista de compras
  comprasContainer.innerHTML = `<h2 class="text-2xl font-semibold mb-2">Lista de Compras Agregada</h2><pre>${Object.entries(compras).map(([i,q])=>`${i}: ${q}`).join('\n')}</pre>`;
}

// Assistente IA
async function perguntarIA() {
  const pergunta = iaPergunta.value;
  if(!pergunta) return;
  iaResposta.textContent = "A processar...";

  const prompt = `Responde à seguinte pergunta sobre receitas, substituições, tempos ou conservação de alimentos:\n${pergunta}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiAPIKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{role:"user", content: prompt}],
        max_tokens: 300
      })
    });
    const data = await response.json();
    const resposta = data.choices[0].message.content;
    iaResposta.textContent = resposta;

  } catch(err){
    console.error(err);
    iaResposta.textContent = "Erro a processar a pergunta.";
  }
}

gerarMenusButton.addEventListener('click', gerarMenus);
iaButton.addEventListener('click', perguntarIA);
