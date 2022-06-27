const productList = document.querySelector('.productWrap'),
  productSelect = document.querySelector('.productSelect'),
  cartData = document.querySelector('.shoppingCart-body');



function init() {
  getProductList()
  getCartList()
}
init();

let productData = [],
  cartList = [];

// 取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      productData = response.data.products;
      renderProductList()
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
}

// 將組產品列表的資料抽出來共用 [消除重複code]
function combineProductHTMLList(item) {
  return `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img
    src="${item.images}"
    alt="">
  <a href="#" class="addCardBtn" data-id="${item.id}" data-class="js-addCart" >加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${item.origin_price}0</del>
  <p class="nowPrice">NT$${item.price}</p>
</li>`
}

function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductHTMLList(item);
  })
  productList.innerHTML = str;
}

// 篩選顯示的資料
productSelect.addEventListener('change', function (e) {
  const category = e.target.value
  if (category == "全部") {
    renderProductList()
    return;
  }

  let str = "";
  productData.forEach(function (item) {

    if (item.category == category) {
      str += combineProductHTMLList(item);
    }
  })
  productList.innerHTML = str;

})

// 加入購物車
productList.addEventListener('click', function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute('data-class');
  if (addCartClass !== "js-addCart") {
    return;
  }
  let productId = e.target.getAttribute('data-id');
  let numCheck = 1;

  cartList.forEach(function (item) {
    if (item.product.id == productId) {
      numCheck = item.quantity += 1;
    };
  });

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {

    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  })
    .then(function (response) {
      getCartList()
    })

})

// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      cartList = response.data.carts;
      document.querySelector('.js-total').textContent = response.data.finalTotal
      renderCartList()
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
}

function renderCartList() {
  let str = "";
  cartList.forEach(function (item) {
    str += `<tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="">
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$${item.product.origin_price}</td>
        <td>${item.quantity}</td>
        <td>NT$${item.product.origin_price * item.quantity}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}">
            clear
          </a>
        </td>
      </tr>`
  })
  cartData.innerHTML = str;
}

// 刪除單筆購物車資料
cartData.addEventListener('click', function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute('data-id');
  if (cartId == null) {
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      alert(`刪除成功～`)
      getCartList()
    })
})

// 刪除全部購物車資料
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      alert(`全部刪除成功～`)
      getCartList()
    })
    .catch(function (error) {
      alert(`購物車內已無商品～`)
    })
})

// 送出訂單資訊
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click', function (e) {
  e.preventDefault();
  // 確認購物車內有商品
  if (cartList.length == 0) {
    alert(`購物車目前尚無商品，請先加入購物車>*<`)
    return;
  }

  // 確認表單資訊皆有填寫
  const customerName = document.querySelector('#customerName').value,
    customerPhone = document.querySelector('#customerPhone').value,
    customerEmail = document.querySelector('#customerEmail').value,
    customerAddress = document.querySelector('#customerAddress').value,
    customerTradeWay = document.querySelector('#tradeWay').value;

  if (customerName == "" || customerPhone == "" || customerEmail == "" ||customerAddress == "" ||customerTradeWay == "") {
    alert(`資料尚未填寫完成～`)
    return;
  }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  })
  .then(function (response) {
    alert(`恭喜訂單送出成功～～`)
    document.querySelector('#customerName').value = "";
    document.querySelector('#customerPhone').value = "";
    document.querySelector('#customerEmail').value = "";
    document.querySelector('#customerAddress').value = "";
    document.querySelector('#tradeWay').value = "ATM";
    getCartList();
  })

})

