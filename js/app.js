let recipesData;
let currentCiclo = 0;

// Carregar JSON
async function loadRecipes() {
    try {
        const res = await fetch('./data/recipes.json'); // Path relativo correto
        if(!res.ok) throw new Error('Falha ao carregar JSON');
        recipesData = await res.json();
        initCicloSelect();
        renderMenu(currentCiclo);
    } catch(err) {
        console.error(err);
        alert('Erro ao carregar receitas. Verifica o path do JSON.');
    }
}

// Inicializa select de ciclos
function initCicloSelect() {
    const select = document.getElementById('ciclo-select');
    select.innerHTML = '';
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

// Renderiza menu
function renderMenu(index) {
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

// Renderiza receita
function renderRecipe(id,index) {
    const recipeDiv = document.getElementById('recipes-list');
    recipeDiv.innerHTML = '';
    const ciclo = recipesData.ciclos[index];
    const recipe = ciclo.receitas.find(r => r.id === id);
    if(recipe){
        recipeDiv.innerHTML = `
            <h3>${recipe.titulo}</h3>
            <p><strong>Ingredientes:</strong><br>${recipe.ingredientes.join('<br>')}</p>
            <p><strong>Passos:</strong><br>${recipe.passos.map((p,i)=> (i+1)+'. '+p).join('<br>')}</p>
        `;
    }
}

// Renderiza lista de compras
function renderShoppingList(index) {
    const list = document.getElementById('shopping-list');
    list.innerHTML = '';
    const ciclo = recipesData.ciclos[index];
    const items = ciclo.receitas.flatMap(r=>r.ingredientes);
    const uniqueItems = [...new Set(items)];
    uniqueItems.forEach(i=>{
        const li = document.createElement('li');
        li.textContent = i;
        list.appendChild(li);
    });
}

// Carregar receitas
loadRecipes();
