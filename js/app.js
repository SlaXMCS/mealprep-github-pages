let recipesData;
let currentCiclo = 0;

// Carregar receitas
fetch('data/recipes.json')
  .then(res => res.json())
  .then(data => {
    recipesData = data;
    initCicloSelect();
    renderMenu(currentCiclo);
  });

// Inicializar select de ciclos
function initCicloSelect() {
  const select = document.getElementById('ciclo-select');
  recipesData.ciclos.forEach((c, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = c.nome;
    select.appendChild(opt);
  });
  select.addEventListener('change', e=>{
    currentCiclo = parseInt(e.target.value);
    renderMenu(currentCiclo);
  });
}

// Render menu do ciclo
function renderMenu(index){
  const menuDiv = document.getElementById('menu-days');
  menuDiv.innerHTML = '';
  const ciclo = recipesData.ciclos[index];
  ciclo.receitas.forEach((r,i)=>{
    const div = document.createElement('div');
    div.textContent = `${i+1}. ${r.titulo}`;
    div.onclick = ()=>renderRecipe(r.id,index);
    menuDiv.appendChild(div);
  });
  renderShoppingList(index);
}

// Render receita
function renderRecipe(id,index){
  const recipeDiv = document.getElementById('recipes-list');
  recipeDiv.innerHTML='';
  const ciclo = recipesData.ciclos[index];
  const recipe = ciclo.receitas.find(r=>r.id===id);
  if(recipe){
    recipeDiv.innerHTML=`
      <h3>${recipe.titulo}</h3>
      <p><strong>Ingredientes:</strong><br>${recipe.ingredientes.join('<br>')}</p>
      <p><strong>Passos:</strong><br>${recipe.passos.map((p,i)=>(i+1)+'. '+p).join('<br>')}</p>
    `;
  }
}

// Lista de compras
function renderShoppingList(index){
  const list = document.getElementById('shopping-list');
  list.innerHTML='';
  const ciclo = recipesData.ciclos[index];
  const items = ciclo.receitas.flatMap(r=>r.ingredientes);
  const unique = [...new Set(items)];
  unique.forEach(i=>{
    const li=document.createElement('li');
    li.textContent=i;
    list.appendChild(li);
  });
}

// Chat IA
document.getElementById('chat-send').addEventListener('click', async ()=>{
  const input = document.getElementById('chat-input').value;
  if(!input) return;
  addChatMessage('Tu: '+input);
  document.getElementById('chat-input').value='';

  const response = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer YOUR_OPENAI_API_KEY'
    },
    body:JSON.stringify({
      model:'gpt-5-mini',
      messages:[{role:'user', content: input}],
      max_tokens:200
    })
  });
  const data = await response.json();
  const reply = data.choices[0].message.content;
  addChatMessage('IA: '+reply);
});

function addChatMessage(msg){
  const chatBox = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.innerHTML=msg;
  chatBox.appendChild(div);
  chatBox.scrollTop=chatBox.scrollHeight;
}
