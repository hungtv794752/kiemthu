/* Vải Chàm – trang demo cho đề tài "Công cụ tăng tính khả dụng của website".
 *
 * Hai phiên bản trên cùng một code:
 *   index.html        -> Phiên bản A: có lỗi usability cố ý (để test và tìm lỗi)
 *   index.html?v=b    -> Phiên bản B: đã cải thiện (để so sánh trước/sau)
 */
(function () {
  'use strict';

  var isB = new URLSearchParams(location.search).get('v') === 'b';
  document.body.classList.add(isB ? 'v-b' : 'v-a');

  /* ---------- Dữ liệu ---------- */
  var PRODUCTS = [
    { id: 3, name: 'Áo sơ mi linen',        cat: 'Áo sơ mi',  price: 329000, color: '#CFD8C9', icon: '👔', sizes: ['S', 'M', 'L', 'XL'], desc: 'Vải linen thoáng mát, tay dài, dễ phối đồ.' },
    { id: 4, name: 'Quần short kaki',       cat: 'Quần',      price: 279000, color: '#C9B38A', icon: '🩳', sizes: ['29', '30', '31', '32'], desc: 'Kaki co giãn nhẹ, lưng thun phía sau.' },
    { id: 5, name: 'Mũ lưỡi trai',          cat: 'Phụ kiện',  price: 129000, color: '#8A9BB5', icon: '🧢', sizes: ['Free size'], desc: 'Vải canvas, khóa chỉnh phía sau.' },
    { id: 1, name: 'Áo thun trắng basic',   cat: 'Áo thun',   price: 189000, color: '#E9EDF2', icon: '👕', sizes: ['S', 'M', 'L', 'XL'], desc: 'Cotton 100%, form vừa, cổ tròn.' },
    { id: 6, name: 'Túi tote vải bố',       cat: 'Phụ kiện',  price:  99000, color: '#E3C98F', icon: '👜', sizes: ['Free size'], desc: 'Vải bố dày, có túi nhỏ bên trong.' },
    { id: 2, name: 'Áo thun chàm nhuộm tay', cat: 'Áo thun',  price: 249000, color: '#2F4B7C', icon: '👕', sizes: ['S', 'M', 'L', 'XL'], desc: 'Nhuộm chàm tự nhiên, mỗi chiếc một sắc độ.' }
  ];

  /* ---------- Trạng thái ---------- */
  var cart = [];            // { id, size, qty }
  var currentCat = 'Tất cả';
  var lastOrder = null;

  /* ---------- Tiện ích ---------- */
  var app = document.getElementById('app');
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var fmt = function (n) { return n.toLocaleString('vi-VN') + 'đ'; };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var byId = function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; };
  var cartTotal = function () {
    return cart.reduce(function (sum, it) { return sum + byId(it.id).price * it.qty; }, 0);
  };

  function updateCount() {
    var n = cart.reduce(function (s, it) { return s + it.qty; }, 0);
    $('#cart-count').textContent = n;
    $('#cart-link').setAttribute('aria-label', 'Giỏ hàng, ' + n + ' sản phẩm');
  }

  var toastTimer;
  function toast(html) {
    var t = $('#toast');
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 4000);
  }

  function thumb(p, small) {
    return '<div class="thumb' + (small ? ' sm' : '') + '" style="background:' + p.color + '" aria-hidden="true"><span>' + p.icon + '</span></div>';
  }

  /* ---------- Trang chủ ---------- */
  function card(p) {
    return '<a class="card" href="#/product/' + p.id + '">' + thumb(p) +
      '<div class="card-body"><h2>' + esc(p.name) + '</h2><p class="price">' + fmt(p.price) + '</p></div></a>';
  }

  function renderHome() {
    var list = currentCat === 'Tất cả' ? PRODUCTS : PRODUCTS.filter(function (p) { return p.cat === currentCat; });
    var cats = ['Tất cả'];
    PRODUCTS.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });

    var chips = isB
      ? '<div class="chips" role="group" aria-label="Lọc theo loại sản phẩm">' + cats.map(function (c) {
          return '<button type="button" class="chip' + (c === currentCat ? ' on' : '') + '" data-cat="' + c + '" aria-pressed="' + (c === currentCat) + '">' + c + '</button>';
        }).join('') + '</div>'
      : '';

    app.innerHTML = '<section class="page"><h1>Bộ sưu tập mùa hè</h1>' + chips +
      '<div class="grid">' + list.map(card).join('') + '</div></section>';

    if (isB) {
      app.querySelectorAll('.chip').forEach(function (b) {
        b.addEventListener('click', function () {
          currentCat = b.dataset.cat;
          renderHome();
          var on = $('.chip.on'); if (on) on.focus();
        });
      });
    }
  }

  /* ---------- Chi tiết sản phẩm ---------- */
  function addToCart(p, size) {
    var found = cart.filter(function (it) { return it.id === p.id && it.size === size; })[0];
    if (found) { found.qty += 1; } else { cart.push({ id: p.id, size: size, qty: 1 }); }
    updateCount();
    if (isB) {
      toast('Đã thêm “' + esc(p.name) + '” (' + esc(size) + ') vào giỏ hàng.<a href="#/cart">Xem giỏ hàng</a>');
    }
  }

  function renderProduct(id) {
    var p = byId(id);
    if (!p) { location.hash = '#/'; return; }

    var sizeUI = isB
      ? '<fieldset><legend>Chọn kích cỡ</legend><div class="sizes">' + p.sizes.map(function (s, i) {
          return '<label class="size-opt"><input type="radio" name="size" value="' + s + '"' + (i === 0 ? ' id="size-first"' : '') + '><span>' + s + '</span></label>';
        }).join('') + '</div><p class="error" id="size-error" hidden>Vui lòng chọn kích cỡ trước khi thêm vào giỏ.</p></fieldset>' +
        '<button type="button" id="add" class="btn-primary block">Thêm vào giỏ hàng</button>'
      : '<div class="field"><label for="size">Size</label><select id="size"><option value="">Chọn</option>' +
        p.sizes.map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('') +
        '</select></div><button type="button" id="add" class="btn-add">OK</button>';

    app.innerHTML = '<section class="page"><a class="back" href="#/"' + (isB ? '' : ' aria-label="Quay lại"') + '>' +
      (isB ? '‹ Quay lại cửa hàng' : '‹') + '</a>' +
      '<div class="product-layout">' + thumb(p) +
      '<div><h1>' + esc(p.name) + '</h1><p class="price">' + fmt(p.price) + '</p><p class="desc">' + esc(p.desc) + '</p>' + sizeUI + '</div></div></section>';

    $('#add').addEventListener('click', function () {
      if (isB) {
        var checked = $('input[name="size"]:checked');
        if (!checked) {
          $('#size-error').hidden = false;
          $('#size-first').focus();
          return;
        }
        $('#size-error').hidden = true;
        addToCart(p, checked.value);
      } else {
        var size = $('#size').value;
        if (!size) { return; }          // Lỗi cố ý: không báo gì khi chưa chọn size
        addToCart(p, size);
      }
    });
  }

  /* ---------- Giỏ hàng ---------- */
  function renderCart() {
    if (!cart.length) {
      app.innerHTML = isB
        ? '<section class="page"><h1>Giỏ hàng</h1><p>Giỏ hàng của bạn đang trống.</p><a class="btn-primary" href="#/">Tiếp tục mua sắm</a></section>'
        : '<section class="page"><h1>Giỏ hàng</h1><p class="muted">Trống</p></section>';
      return;
    }

    var rows = cart.map(function (it, i) {
      var p = byId(it.id);
      var qty = isB
        ? '<div class="qty"><button type="button" class="qty-btn" data-act="dec" data-i="' + i + '" aria-label="Giảm số lượng ' + esc(p.name) + '">−</button><span aria-live="polite">' + it.qty + '</span><button type="button" class="qty-btn" data-act="inc" data-i="' + i + '" aria-label="Tăng số lượng ' + esc(p.name) + '">+</button></div>'
        : '<span class="qty">SL: ' + it.qty + '</span>';
      var rm = isB
        ? '<button type="button" class="rm-text" data-act="rm" data-i="' + i + '">Xóa</button>'
        : '<button type="button" class="rm" data-act="rm" data-i="' + i + '" aria-label="Xóa ' + esc(p.name) + '">×</button>';
      return '<li class="row">' + thumb(p, true) +
        '<div class="row-info"><strong>' + esc(p.name) + '</strong><span>Size ' + esc(it.size) + '</span></div>' +
        qty + '<div class="row-price">' + fmt(p.price * it.qty) + '</div>' + rm + '</li>';
    }).join('');

    var next = isB
      ? '<a class="btn-primary" href="#/checkout">Tiến hành đặt hàng</a>'
      : '<a class="btn-next" href="#/checkout">Tiếp</a>';

    app.innerHTML = '<section class="page"><h1>Giỏ hàng</h1><ul class="rows">' + rows + '</ul>' +
      '<div class="cart-total"><span>Tổng cộng</span><span>' + fmt(cartTotal()) + '</span></div>' +
      '<div class="cart-actions">' + next + '</div></section>';

    $('.rows').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) { return; }
      var i = +btn.dataset.i, it = cart[i], act = btn.dataset.act;
      if (act === 'inc') { it.qty += 1; }
      if (act === 'dec') { it.qty -= 1; if (it.qty <= 0) { cart.splice(i, 1); } }
      if (act === 'rm') {
        var removed = byId(it.id).name;
        cart.splice(i, 1);
        if (isB) { toast('Đã xóa “' + esc(removed) + '” khỏi giỏ hàng.'); }
      }
      updateCount();
      renderCart();
    });
  }

  /* ---------- Thanh toán ---------- */
  function validate(v) {
    var e = {};
    if (!v.name.trim()) { e.name = 'Vui lòng nhập họ và tên.'; }
    if (!/^0\d{9}$/.test(v.phone.replace(/\s/g, ''))) { e.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0. Ví dụ: 0901234567.'; }
    if (!v.address.trim()) { e.address = 'Vui lòng nhập địa chỉ nhận hàng.'; }
    return e;
  }

  function summaryHTML() {
    return '<aside class="summary"><h2>Đơn hàng của bạn</h2><ul>' + cart.map(function (it) {
      var p = byId(it.id);
      return '<li><span>' + esc(p.name) + ' (' + esc(it.size) + ') × ' + it.qty + '</span><span>' + fmt(p.price * it.qty) + '</span></li>';
    }).join('') + '</ul><div class="sum-total"><span>Tổng cộng</span><span>' + fmt(cartTotal()) + '</span></div></aside>';
  }

  function renderCheckout() {
    if (!cart.length) { location.hash = '#/cart'; return; }

    var form = isB
      ? '<form id="form" novalidate>' +
        '<div class="field"><label for="name">Họ và tên</label><input type="text" id="name" autocomplete="name"><p class="error" id="e-name" hidden></p></div>' +
        '<div class="field"><label for="phone">Số điện thoại</label><input type="tel" id="phone" autocomplete="tel" inputmode="tel"><p class="hint">Ví dụ: 0901234567</p><p class="error" id="e-phone" hidden></p></div>' +
        '<div class="field"><label for="address">Địa chỉ nhận hàng</label><input type="text" id="address" autocomplete="street-address"><p class="error" id="e-address" hidden></p></div>' +
        '<fieldset><legend>Hình thức thanh toán</legend>' +
        '<label><input type="radio" name="pay" value="Thanh toán khi nhận hàng" checked> Thanh toán khi nhận hàng</label><br>' +
        '<label><input type="radio" name="pay" value="Chuyển khoản"> Chuyển khoản</label></fieldset>' +
        '<button type="submit" class="btn-primary block">Đặt hàng</button></form>'
      : '<form id="form" novalidate><div id="banner"></div>' +
        '<div class="field"><input type="text" id="name" placeholder="Tên"></div>' +
        '<div class="field"><input type="text" id="phone" placeholder="SĐT"></div>' +
        '<div class="field"><input type="text" id="address" placeholder="Địa chỉ"></div>' +
        '<div class="field"><select id="pay"><option>COD</option><option>CK</option></select></div>' +
        '<button type="submit" class="btn-send">Gửi</button></form>';

    app.innerHTML = '<section class="page"><h1>' + (isB ? 'Thông tin đặt hàng' : 'Đặt hàng') + '</h1>' +
      '<div class="checkout">' + form + (isB ? summaryHTML() : '') + '</div></section>';

    $('#form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = { name: $('#name').value, phone: $('#phone').value, address: $('#address').value };
      var errs = validate(v);
      var keys = Object.keys(errs);

      if (keys.length) {
        if (isB) {
          ['name', 'phone', 'address'].forEach(function (k) {
            var box = $('#e-' + k), input = $('#' + k);
            if (errs[k]) { box.textContent = errs[k]; box.hidden = false; input.setAttribute('aria-invalid', 'true'); }
            else { box.hidden = true; input.removeAttribute('aria-invalid'); }
          });
          $('#' + keys[0]).focus();
        } else {
          $('#banner').innerHTML = '<p class="banner">Dữ liệu không hợp lệ.</p>';   // Lỗi cố ý: không chỉ rõ ô nào sai
        }
        return;
      }

      lastOrder = {
        code: 'VC' + Math.floor(100000 + Math.random() * 900000),
        name: v.name.trim(),
        total: cartTotal(),
        count: cart.reduce(function (s, it) { return s + it.qty; }, 0)
      };
      cart = [];
      updateCount();
      location.hash = '#/done';
    });
  }

  /* ---------- Hoàn tất ---------- */
  function renderDone() {
    if (!lastOrder) { location.hash = '#/'; return; }
    app.innerHTML = isB
      ? '<section class="page done"><h1>Đặt hàng thành công</h1>' +
        '<p>Cảm ơn ' + esc(lastOrder.name) + '. Mã đơn hàng của bạn là <strong>' + lastOrder.code + '</strong>.</p>' +
        '<p>' + lastOrder.count + ' sản phẩm, tổng cộng ' + fmt(lastOrder.total) + '. Chúng tôi sẽ gọi xác nhận trong 24 giờ.</p>' +
        '<a class="btn-primary" href="#/">Tiếp tục mua sắm</a></section>'
      : '<section class="page"><p class="muted">Đã gửi.</p></section>';
  }

  /* ---------- Điều hướng ---------- */
  function route() {
    var parts = (location.hash.replace(/^#/, '') || '/').split('/').filter(Boolean);
    if (parts[0] === 'product') { renderProduct(+parts[1]); }
    else if (parts[0] === 'cart') { renderCart(); }
    else if (parts[0] === 'checkout') { renderCheckout(); }
    else if (parts[0] === 'done') { renderDone(); }
    else { renderHome(); }
  }

  window.addEventListener('hashchange', function () {
    route();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  });

  updateCount();
  route();
})();
