function initAdmin() {
    getOrderList()
}

initAdmin()

let orderData = [];

const orderList = document.querySelector('.js-orderList');

function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token
        }
    })
        .then(function (response) {
            orderData = response.data.orders;

            let str = '';
            orderData.forEach(function (item) {
                // 組日期字串 
                const timeStamp = new Date(item.createdAt * 1000);
                console.log(timeStamp);
                const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDay()}`
                // 組購買項目的字串
                let productStr = '';
                item.products.forEach(function (productItem) {
                    productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`
                })
                // 判斷訂單處理狀態
                let orderStatus = '';
                if (item.paid == false) {
                    orderStatus = '未處理';
                } else {
                    orderStatus = '已處理';
                }

                str += `<tr>
                  <td>${item.id}</td>
                  <td>
                      <p>${item.user.name}</p>
                      <p>${item.user.tel}</p>
                  </td>
                  <td>${item.user.address}</td>
                  <td>${item.user.email}</td>
                  <td>
                  ${productStr}
                  </td>
                  <td>${orderTime}</td>
                  <td class="orderStatus">
                      <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
                  </td>
                  <td>
                      <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                  </td>
          </tr>`
            })
            orderList.innerHTML = str;
        })
}

orderList.addEventListener('click', function (e) {
    e.preventDefault();
    const targetClass = e.target.getAttribute('class');
    let id = e.target.getAttribute('data-id');

    if (targetClass == 'orderStatus') {
        let status = e.target.getAttribute('data-status');
        changeOrderStatus(status, id);
        return;
    }

    if (targetClass == 'delSingleOrder-Btn js-orderDelete') {
        deleteOrderItem(id)
        return
    }
})

// 修改訂單狀態
function changeOrderStatus(status, id) {
    let newStatus;
    status == 'true' ? newStatus = false : newStatus = true;
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    },
        {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            alert`修改訂單狀態成功`
            getOrderList()
        })
}

// 刪除特定訂單資料
function deleteOrderItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'Authorization': token
        }
    })
        .then(function (response) {
            alert(`刪除成功～`)
            getOrderList()
        })
}

// 刪除全部訂單資料
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token
        }
    })
        .then(function (response) {
            alert(`訂單已全部刪除了～`)
            getOrderList()
        })
})


