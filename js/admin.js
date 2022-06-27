let orderData = [];

const orderList = document.querySelector('.js-orderList');

function initAdmin() {
    getOrderList()
}

initAdmin()

function renderC3_LV2() {
    let obj = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (obj[productItem.title] == undefined) {
                obj[productItem.title] = productItem.quantity * productItem.price;
            } else {
                obj[productItem.title] += productItem.quantity * productItem.price;
            }
        })
    })

    // 重組為c3格式
    let originAry = Object.keys(obj);
    let newData = [];
    originAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(obj[item])
        newData.push(ary)
    })

    // 依照品項銷售量排序 [高 -> 低]
    newData.sort(function(a,b){
        return b[1] - a[1]
    })

    if(newData.length > 3){
        let otherTotal = 0;
        newData.forEach(function(item,index){
            if(index > 2){
                otherTotal += newData[index][1]
            }
        })
        newData.splice(3)
        newData.push(['其他',otherTotal])
        console.log(newData);
    }


    const chart = c3.generate({
        bindto: "#chart",
        data: {
            columns: newData,
            type: 'donut',
        },
        donut: {
            title: "銷售量"
        },
        color: {
            pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
        }
    });
}





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
            console.log(orderData);
            orderList.innerHTML = str;
            renderC3_LV2()
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


