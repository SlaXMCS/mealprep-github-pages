let recipesData;
let currentCiclo = 0;

// Função async para carregar receitas
async function loadRecipes() {
  try {
    const res = await fetch('./data/recipes.json');
    recipesData = await res.json();
    initCicloSelect();
    renderMenu(currentCiclo);
  } catch (err) {
    console.error('Erro a carregar receitas:', err);
    alert('Não foi possível carregar as receitas. Verifica o path do JSON.');
  }
}

loadRecipes();

// Inicializar select de ciclos
function initCicloSelect() {
  const select = document.getElementById('ciclo-select');
  recipesData.ciclos.forEach((c, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = c.nome;
    select.appendChild(option);
  });
  select.addEventListener('change', e => {
    currentCiclo = parseInt(e.target.value);
    renderMenu(currentCiclo);
  });
}

// Render menu do ciclo
function renderMenu(index) {
  const menuDiv = document.getElementById('menu-days');
  menuDiv.innerHTML = '';
  const ciclo = recipesData.ciclos[index];
  ciclo.receitas.forEach((r, i) => {
    const div = document.createElement('div');
    div.textContent = `${i + 1}. ${r.titulo}`;
    div.onclick = () => renderRecipe(r.id, index);
    menuDiv.appendChild(div);
  });
  renderShoppingList(index);
}

// Render receita
function renderRecipe(id, index) {
  const recipeDiv = document.getElementById('recipes-list');
  recipeDiv.innerHTML = '';
  const ciclo = recipesData.ciclos[index];
  const recipe = ciclo.receitas.find(r => r.id === id);
  if (recipe) {
    recipeDiv.innerHTML = `
      <h3>${recipe.titulo}</h3>
      <p><strong>Ingredientes:</strong><br>${recipe.ingredientes.join('<br>')}</p>
      <p><strong>Passos:</strong><br>${recipe.passos.map((p,i)=> (i+1)+'. '+p).join('<br>')}</p>
    `;
  }
}

// Lista de compras
function renderShoppingList(index) {
  const list = document.getElementById('shopping-list');
  list.innerHTML = '';
  const ciclo = recipesData.ciclos[index];
  const items = ciclo.receitas.flatMap(r => r.ingredientes);
  const uniqueItems = [...new Set(items)];
  uniqueItems.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    list.appendChild(li);
  });
}

// Chat IA
document.getElementById('chat-send').addEventListener('click', async () => {
  const input = document.getElementById('chat-input').value.trim();
  if (!input) return;
  addChatMessage('Tu: ' + input);
  document.getElementById('chat-input').value = '';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [{role:'user', content: input}],
        max_tokens: 200
      })
    });
    const data = await response.json();
    const reply = data.choices[0].message.content;
    addChatMessage('IA: ' + reply);
  } catch (err) {
    addChatMessage('IA: Erro a responder, verifica a API key.');
    console.error(err);
  }
});

function addChatMessage(msg) {
  const chatBox = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.innerHTML = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
