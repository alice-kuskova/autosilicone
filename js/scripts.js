const IMAGES_PATH = './assets/images/';
const GOODS_PATH = './goods.yaml';

let selectedGood = null;


// Load YAML data
let allData = "";
fetch(GOODS_PATH)
.then(response => response.text())
.then(yamlData => {
  allData = jsyaml.load(yamlData);
  showCatalog();
  processUrl();
});

// Catch browser movements by hystory
window.addEventListener('popstate', function (event) {
  selectedGood = null;
  const myModal = new bootstrap.Modal('#detailModal');
  if (myModal) {
    myModal.hide();
  }
  processUrl();
  
});

function processUrl() {
  if (!scrollToDetailIfNecessary()) {
    const id = getIdFromUrl();
    if (id) {
      const good = getGoodByTitle(decodeURIComponent(id));
      if (good) {
        showDetailForm(good);
      }
      else {
        scrollToElementId(id);
      }
    }
  };
  activateModalCLoseAction()
}

function setUrlWithoutReload(path) {
  history.pushState(null, "", path);
}

// If #details/{good.title} is in Url, open modal with details
function showDetailForm(good) {
  if (good !== null) {
    selectedGood = good;
    showDetailPage(good);
  }
}

function scrollToDetailIfNecessary() {
  const good = getGoodToScrollFromUrlValue();
  if (good !== null) {
    selectedGood = good;
    scrollToGood(good);
    return true;
  }
  return false;
}

function scrollToGood(good) {
  scrollToElementId(encodeURIComponent(good.title));
}

function scrollToElementId(id) {
  setTimeout(function() {
    const place = document.getElementById(id);
    if (place) {
      place.scrollIntoView({behavior: "instant"});
    }}, 100);
}

function getGoodByTitle () {
  const url = window.location.href;
  const regex = /l#([^&]+)/;
  const match = url.match(regex);
  if (match) {
    const encodedTitle = match[1];
  
    const title = decodeURIComponent(encodedTitle);

    const good = getGoodByTitle(title);

    return good;
  }

  return null;
};

function getIdFromUrl() {
  const url = window.location.href;
  const regex = /l#([^&]+)/;
  const match = url.match(regex);
  if (match) {
    const encodedTitle = match[1];
    return decodeURIComponent(encodedTitle);
  }

  return null;
};

function getGoodToScrollFromUrlValue() {
  const url = window.location.href;
  const regex = /l?scrollTo=([^&]+)/;
  const match = url.match(regex);
  if (match) {
    const encodedTitle = match[1];
  
    const title = decodeURIComponent(encodedTitle);

    const good = getGoodByTitle(title);

    return good;
  }

  return null;
};

function getGoodByTitle(goodTitle) {
  let foundGood = null;
  allData.forEach(category => {
    category.goods.forEach(good => {
      if (good.title.toLowerCase() === goodTitle.toLowerCase()) {
        foundGood = good;
      }
    });
  });
  return foundGood;
};

// Connect modal
function activateModalCLoseAction() {
  const detailModal = document.getElementById('detailModal')
  if (detailModal) {
    
    detailModal.addEventListener('hide.bs.modal', event => {
      setUrlWithoutReload("index.html?scrollTo="+encodeURIComponent(selectedGood.title));
    })
  }
}

function showCatalog() {
  const categoriesList = document.getElementById('categories');
  
  // Create categories and goods
  allData.forEach(category => {
    const goodsListD2 = document.createElement('div');
    goodsListD2.classList.add('row', 'gx-4', 'gx-lg-5', 'row-cols-1', 'row-cols-sm-2', 'row-cols-md-3', 'row-cols-xl-4', 'justify-content-left');
    
    // Add goods to goods list
    category.goods.forEach(good => {
      // Create thumbnail element
      const thumbHtml = document.createElement('div');
      thumbHtml.innerHTML = `<div class="col mb-5" id="${encodeURIComponent(good.title)}">
                              <div class="card h-100">
                              <!-- Product image-->
                              <img class="card-img-top img-thumbnail" src="${IMAGES_PATH}${good.image}" alt="${good.title}" />
                              <!-- Product details-->
                              <div class="card-body p-4">
                                  <div class="text-center">
                                    <!-- Product name-->
                                    <h5 class="fw-bolder">${good.title}</h5>
                                    <!-- Product price-->
                                    ${good.price} ${good.currency}
                                    </div>
                                    </div>
                                    <!-- Product actions-->
                                    <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                    <div class="text-center">
                                    <a class="btn btn-outline-dark mt-auto" onClick="showDetailModal('${good.title}')">Подробнее</a>
                                    </div>
                                    </div>
                                    </div>
                                    </div>`;
        goodsListD2.appendChild(thumbHtml);
    });
                                  
    // Create goods list element
    const goodsListEl = document.createElement('div');
    goodsListEl.classList.add('goods-list', 'container', 'px-4', 'px-lg-5', 'py-2');
    
    // Create category element
    const categoryEl = document.createElement('div');
    categoryEl.classList.add('category', 'py-4');
    categoryEl.id = encodeURIComponent(category.name);
    categoryEl.innerHTML = `<div class="row">
                              <div class="col align-self-end">
                                <h2>${category.name}</h2>
                              </div>`
                              + (category.image
                               ? (`<div class="col-lg-4 col-md-3 col-sm-6">
                                    <img src="${IMAGES_PATH}${category.image}" alt="${category.name}" class="img-fluid">
                                  </div>`)
                                : "")
                              + `</div>`;
    
    goodsListEl.appendChild(categoryEl);
    goodsListEl.appendChild(goodsListD2);
    
    categoriesList.appendChild(goodsListEl);
  });
};

function showDetailPage(good)
{
  const modal = document.getElementById("detailModal");
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header text-center">
          <h2 class="modal-title" id="detailModalLabel">${good.title}</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Product section-->
          <section class="py-2">
            <div class="container px-4 px-lg-5">
                  <div class="fs-2 mb-3 text-center">
                      <span>${good.price} ${good.currency}</span>
                  </div>
                  <div>
                    <p class="lead">${good.description}</p>
                  </div>
                  <div>
                    <img class="card-img-top mb-5 mb-md-0" src="${IMAGES_PATH}${good.image}" alt="${good.title}" />
                  </div>
            </div>
          </section>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
        </div>
      </div>
    </div>`;
  
  

    setTimeout(function() {
      const myModal = new bootstrap.Modal('#detailModal');
      const detailPlace = document.getElementById(encodeURIComponent(good.title));
      if (detailPlace) {
        detailPlace.scrollIntoView({behavior: "instant"});
      }
      setTimeout(function() {myModal.show()}, 500);
      }, 500);
}

function showDetailModal(goodId)
{
  const good = getGoodByTitle(goodId, allData);
  selectedGood = good;
  showDetailPage(good);
  setUrlWithoutReload("index.html#"+ encodeURIComponent(good.title))
}
