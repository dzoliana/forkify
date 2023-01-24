import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

//-------------------------------------------------------------------------

const controllRecipes = async function (e) {
  e.preventDefault();
  try {
    //dinamički uzimamo id iz hash-a
    const id = window.location.hash.slice(1);
    //console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);

    //TEST
    // controlServings();
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
//controllRecipes();

//-------------------------------------------------------------------------

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // console.log(resultsView);
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    //4) Render initial pagination
    //prikaz botuna za page2 odmah nakon prikaza search rezultata
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
//controlSearchResults();

//-------------------------------------------------------------------------

const controlPagination = function (goToPage) {
  console.log(goToPage);

  // 1) Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2) Render new pagination buttons
  paginationView.render(model.state.search);
};

//-------------------------------------------------------------------------

//za promjenu broja porcija
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

//-------------------------------------------------------------------------

const controlAddBookmark = function () {
  // 1) Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //  console.log(model.state.recipe);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  //3)Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

//-------------------------------------------------------------------------

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//-------------------------------------------------------------------------

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    //console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
      location.reload();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log('💥', err);
    addRecipeView.renderError(err.message);
  }
};

//-------------------------------------------------------------------------
//publisher-subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controllRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
