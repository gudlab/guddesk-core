var we, m, st, lt, F, je, at, ct, ut, Ue, Ce, Ne, pe = {}, he = [], Ht = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, ke = Array.isArray;
function R(t, e) {
  for (var n in e) t[n] = e[n];
  return t;
}
function He(t) {
  t && t.parentNode && t.parentNode.removeChild(t);
}
function ft(t, e, n) {
  var i, r, o, l = {};
  for (o in e) o == "key" ? i = e[o] : o == "ref" ? r = e[o] : l[o] = e[o];
  if (arguments.length > 2 && (l.children = arguments.length > 3 ? we.call(arguments, 2) : n), typeof t == "function" && t.defaultProps != null) for (o in t.defaultProps) l[o] === void 0 && (l[o] = t.defaultProps[o]);
  return fe(t, l, i, r, null);
}
function fe(t, e, n, i, r) {
  var o = { type: t, props: e, key: n, ref: i, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: r ?? ++st, __i: -1, __u: 0 };
  return r == null && m.vnode != null && m.vnode(o), o;
}
function D(t) {
  return t.children;
}
function ee(t, e) {
  this.props = t, this.context = e;
}
function j(t, e) {
  if (e == null) return t.__ ? j(t.__, t.__i + 1) : null;
  for (var n; e < t.__k.length; e++) if ((n = t.__k[e]) != null && n.__e != null) return n.__e;
  return typeof t.type == "function" ? j(t) : null;
}
function Dt(t) {
  if (t.__P && t.__d) {
    var e = t.__v, n = e.__e, i = [], r = [], o = R({}, e);
    o.__v = e.__v + 1, m.vnode && m.vnode(o), De(t.__P, o, e, t.__n, t.__P.namespaceURI, 32 & e.__u ? [n] : null, i, n ?? j(e), !!(32 & e.__u), r), o.__v = e.__v, o.__.__k[o.__i] = o, ht(i, o, r), e.__e = e.__ = null, o.__e != n && dt(o);
  }
}
function dt(t) {
  if ((t = t.__) != null && t.__c != null) return t.__e = t.__c.base = null, t.__k.some(function(e) {
    if (e != null && e.__e != null) return t.__e = t.__c.base = e.__e;
  }), dt(t);
}
function Ge(t) {
  (!t.__d && (t.__d = !0) && F.push(t) && !ve.__r++ || je != m.debounceRendering) && ((je = m.debounceRendering) || at)(ve);
}
function ve() {
  for (var t, e = 1; F.length; ) F.length > e && F.sort(ct), t = F.shift(), e = F.length, Dt(t);
  ve.__r = 0;
}
function _t(t, e, n, i, r, o, l, a, u, c, _) {
  var s, p, d, h, $, b, y, g = i && i.__k || he, U = e.length;
  for (u = zt(n, e, g, u, U), s = 0; s < U; s++) (d = n.__k[s]) != null && (p = d.__i != -1 && g[d.__i] || pe, d.__i = s, b = De(t, d, p, r, o, l, a, u, c, _), h = d.__e, d.ref && p.ref != d.ref && (p.ref && ze(p.ref, null, d), _.push(d.ref, d.__c || h, d)), $ == null && h != null && ($ = h), (y = !!(4 & d.__u)) || p.__k === d.__k ? u = pt(d, u, t, y) : typeof d.type == "function" && b !== void 0 ? u = b : h && (u = h.nextSibling), d.__u &= -7);
  return n.__e = $, u;
}
function zt(t, e, n, i, r) {
  var o, l, a, u, c, _ = n.length, s = _, p = 0;
  for (t.__k = new Array(r), o = 0; o < r; o++) (l = e[o]) != null && typeof l != "boolean" && typeof l != "function" ? (typeof l == "string" || typeof l == "number" || typeof l == "bigint" || l.constructor == String ? l = t.__k[o] = fe(null, l, null, null, null) : ke(l) ? l = t.__k[o] = fe(D, { children: l }, null, null, null) : l.constructor === void 0 && l.__b > 0 ? l = t.__k[o] = fe(l.type, l.props, l.key, l.ref ? l.ref : null, l.__v) : t.__k[o] = l, u = o + p, l.__ = t, l.__b = t.__b + 1, a = null, (c = l.__i = Lt(l, n, u, s)) != -1 && (s--, (a = n[c]) && (a.__u |= 2)), a == null || a.__v == null ? (c == -1 && (r > _ ? p-- : r < _ && p++), typeof l.type != "function" && (l.__u |= 4)) : c != u && (c == u - 1 ? p-- : c == u + 1 ? p++ : (c > u ? p-- : p++, l.__u |= 4))) : t.__k[o] = null;
  if (s) for (o = 0; o < _; o++) (a = n[o]) != null && (2 & a.__u) == 0 && (a.__e == i && (i = j(a)), mt(a, a));
  return i;
}
function pt(t, e, n, i) {
  var r, o;
  if (typeof t.type == "function") {
    for (r = t.__k, o = 0; r && o < r.length; o++) r[o] && (r[o].__ = t, e = pt(r[o], e, n, i));
    return e;
  }
  t.__e != e && (i && (e && t.type && !e.parentNode && (e = j(t)), n.insertBefore(t.__e, e || null)), e = t.__e);
  do
    e = e && e.nextSibling;
  while (e != null && e.nodeType == 8);
  return e;
}
function Lt(t, e, n, i) {
  var r, o, l, a = t.key, u = t.type, c = e[n], _ = c != null && (2 & c.__u) == 0;
  if (c === null && a == null || _ && a == c.key && u == c.type) return n;
  if (i > (_ ? 1 : 0)) {
    for (r = n - 1, o = n + 1; r >= 0 || o < e.length; ) if ((c = e[l = r >= 0 ? r-- : o++]) != null && (2 & c.__u) == 0 && a == c.key && u == c.type) return l;
  }
  return -1;
}
function Ke(t, e, n) {
  e[0] == "-" ? t.setProperty(e, n ?? "") : t[e] = n == null ? "" : typeof n != "number" || Ht.test(e) ? n : n + "px";
}
function ae(t, e, n, i, r) {
  var o, l;
  e: if (e == "style") if (typeof n == "string") t.style.cssText = n;
  else {
    if (typeof i == "string" && (t.style.cssText = i = ""), i) for (e in i) n && e in n || Ke(t.style, e, "");
    if (n) for (e in n) i && n[e] == i[e] || Ke(t.style, e, n[e]);
  }
  else if (e[0] == "o" && e[1] == "n") o = e != (e = e.replace(ut, "$1")), l = e.toLowerCase(), e = l in t || e == "onFocusOut" || e == "onFocusIn" ? l.slice(2) : e.slice(2), t.l || (t.l = {}), t.l[e + o] = n, n ? i ? n.u = i.u : (n.u = Ue, t.addEventListener(e, o ? Ne : Ce, o)) : t.removeEventListener(e, o ? Ne : Ce, o);
  else {
    if (r == "http://www.w3.org/2000/svg") e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if (e != "width" && e != "height" && e != "href" && e != "list" && e != "form" && e != "tabIndex" && e != "download" && e != "rowSpan" && e != "colSpan" && e != "role" && e != "popover" && e in t) try {
      t[e] = n ?? "";
      break e;
    } catch {
    }
    typeof n == "function" || (n == null || n === !1 && e[4] != "-" ? t.removeAttribute(e) : t.setAttribute(e, e == "popover" && n == 1 ? "" : n));
  }
}
function Je(t) {
  return function(e) {
    if (this.l) {
      var n = this.l[e.type + t];
      if (e.t == null) e.t = Ue++;
      else if (e.t < n.u) return;
      return n(m.event ? m.event(e) : e);
    }
  };
}
function De(t, e, n, i, r, o, l, a, u, c) {
  var _, s, p, d, h, $, b, y, g, U, L, Z, qe, le, Se, M = e.type;
  if (e.constructor !== void 0) return null;
  128 & n.__u && (u = !!(32 & n.__u), o = [a = e.__e = n.__e]), (_ = m.__b) && _(e);
  e: if (typeof M == "function") try {
    if (y = e.props, g = "prototype" in M && M.prototype.render, U = (_ = M.contextType) && i[_.__c], L = _ ? U ? U.props.value : _.__ : i, n.__c ? b = (s = e.__c = n.__c).__ = s.__E : (g ? e.__c = s = new M(y, L) : (e.__c = s = new ee(y, L), s.constructor = M, s.render = Wt), U && U.sub(s), s.state || (s.state = {}), s.__n = i, p = s.__d = !0, s.__h = [], s._sb = []), g && s.__s == null && (s.__s = s.state), g && M.getDerivedStateFromProps != null && (s.__s == s.state && (s.__s = R({}, s.__s)), R(s.__s, M.getDerivedStateFromProps(y, s.__s))), d = s.props, h = s.state, s.__v = e, p) g && M.getDerivedStateFromProps == null && s.componentWillMount != null && s.componentWillMount(), g && s.componentDidMount != null && s.__h.push(s.componentDidMount);
    else {
      if (g && M.getDerivedStateFromProps == null && y !== d && s.componentWillReceiveProps != null && s.componentWillReceiveProps(y, L), e.__v == n.__v || !s.__e && s.shouldComponentUpdate != null && s.shouldComponentUpdate(y, s.__s, L) === !1) {
        e.__v != n.__v && (s.props = y, s.state = s.__s, s.__d = !1), e.__e = n.__e, e.__k = n.__k, e.__k.some(function(B) {
          B && (B.__ = e);
        }), he.push.apply(s.__h, s._sb), s._sb = [], s.__h.length && l.push(s);
        break e;
      }
      s.componentWillUpdate != null && s.componentWillUpdate(y, s.__s, L), g && s.componentDidUpdate != null && s.__h.push(function() {
        s.componentDidUpdate(d, h, $);
      });
    }
    if (s.context = L, s.props = y, s.__P = t, s.__e = !1, Z = m.__r, qe = 0, g) s.state = s.__s, s.__d = !1, Z && Z(e), _ = s.render(s.props, s.state, s.context), he.push.apply(s.__h, s._sb), s._sb = [];
    else do
      s.__d = !1, Z && Z(e), _ = s.render(s.props, s.state, s.context), s.state = s.__s;
    while (s.__d && ++qe < 25);
    s.state = s.__s, s.getChildContext != null && (i = R(R({}, i), s.getChildContext())), g && !p && s.getSnapshotBeforeUpdate != null && ($ = s.getSnapshotBeforeUpdate(d, h)), le = _ != null && _.type === D && _.key == null ? vt(_.props.children) : _, a = _t(t, ke(le) ? le : [le], e, n, i, r, o, l, a, u, c), s.base = e.__e, e.__u &= -161, s.__h.length && l.push(s), b && (s.__E = s.__ = null);
  } catch (B) {
    if (e.__v = null, u || o != null) if (B.then) {
      for (e.__u |= u ? 160 : 128; a && a.nodeType == 8 && a.nextSibling; ) a = a.nextSibling;
      o[o.indexOf(a)] = null, e.__e = a;
    } else {
      for (Se = o.length; Se--; ) He(o[Se]);
      Ee(e);
    }
    else e.__e = n.__e, e.__k = n.__k, B.then || Ee(e);
    m.__e(B, e, n);
  }
  else o == null && e.__v == n.__v ? (e.__k = n.__k, e.__e = n.__e) : a = e.__e = Ft(n.__e, e, n, i, r, o, l, u, c);
  return (_ = m.diffed) && _(e), 128 & e.__u ? void 0 : a;
}
function Ee(t) {
  t && (t.__c && (t.__c.__e = !0), t.__k && t.__k.some(Ee));
}
function ht(t, e, n) {
  for (var i = 0; i < n.length; i++) ze(n[i], n[++i], n[++i]);
  m.__c && m.__c(e, t), t.some(function(r) {
    try {
      t = r.__h, r.__h = [], t.some(function(o) {
        o.call(r);
      });
    } catch (o) {
      m.__e(o, r.__v);
    }
  });
}
function vt(t) {
  return typeof t != "object" || t == null || t.__b > 0 ? t : ke(t) ? t.map(vt) : R({}, t);
}
function Ft(t, e, n, i, r, o, l, a, u) {
  var c, _, s, p, d, h, $, b = n.props || pe, y = e.props, g = e.type;
  if (g == "svg" ? r = "http://www.w3.org/2000/svg" : g == "math" ? r = "http://www.w3.org/1998/Math/MathML" : r || (r = "http://www.w3.org/1999/xhtml"), o != null) {
    for (c = 0; c < o.length; c++) if ((d = o[c]) && "setAttribute" in d == !!g && (g ? d.localName == g : d.nodeType == 3)) {
      t = d, o[c] = null;
      break;
    }
  }
  if (t == null) {
    if (g == null) return document.createTextNode(y);
    t = document.createElementNS(r, g, y.is && y), a && (m.__m && m.__m(e, o), a = !1), o = null;
  }
  if (g == null) b === y || a && t.data == y || (t.data = y);
  else {
    if (o = o && we.call(t.childNodes), !a && o != null) for (b = {}, c = 0; c < t.attributes.length; c++) b[(d = t.attributes[c]).name] = d.value;
    for (c in b) d = b[c], c == "dangerouslySetInnerHTML" ? s = d : c == "children" || c in y || c == "value" && "defaultValue" in y || c == "checked" && "defaultChecked" in y || ae(t, c, null, d, r);
    for (c in y) d = y[c], c == "children" ? p = d : c == "dangerouslySetInnerHTML" ? _ = d : c == "value" ? h = d : c == "checked" ? $ = d : a && typeof d != "function" || b[c] === d || ae(t, c, d, b[c], r);
    if (_) a || s && (_.__html == s.__html || _.__html == t.innerHTML) || (t.innerHTML = _.__html), e.__k = [];
    else if (s && (t.innerHTML = ""), _t(e.type == "template" ? t.content : t, ke(p) ? p : [p], e, n, i, g == "foreignObject" ? "http://www.w3.org/1999/xhtml" : r, o, l, o ? o[0] : n.__k && j(n, 0), a, u), o != null) for (c = o.length; c--; ) He(o[c]);
    a || (c = "value", g == "progress" && h == null ? t.removeAttribute("value") : h != null && (h !== t[c] || g == "progress" && !h || g == "option" && h != b[c]) && ae(t, c, h, b[c], r), c = "checked", $ != null && $ != t[c] && ae(t, c, $, b[c], r));
  }
  return t;
}
function ze(t, e, n) {
  try {
    if (typeof t == "function") {
      var i = typeof t.__u == "function";
      i && t.__u(), i && e == null || (t.__u = t(e));
    } else t.current = e;
  } catch (r) {
    m.__e(r, n);
  }
}
function mt(t, e, n) {
  var i, r;
  if (m.unmount && m.unmount(t), (i = t.ref) && (i.current && i.current != t.__e || ze(i, null, e)), (i = t.__c) != null) {
    if (i.componentWillUnmount) try {
      i.componentWillUnmount();
    } catch (o) {
      m.__e(o, e);
    }
    i.base = i.__P = null;
  }
  if (i = t.__k) for (r = 0; r < i.length; r++) i[r] && mt(i[r], e, n || typeof t.type != "function");
  n || He(t.__e), t.__c = t.__ = t.__e = void 0;
}
function Wt(t, e, n) {
  return this.constructor(t, n);
}
function gt(t, e, n) {
  var i, r, o, l;
  e == document && (e = document.documentElement), m.__ && m.__(t, e), r = (i = !1) ? null : e.__k, o = [], l = [], De(e, t = e.__k = ft(D, null, [t]), r || pe, pe, e.namespaceURI, r ? null : e.firstChild ? we.call(e.childNodes) : null, o, r ? r.__e : e.firstChild, i, l), ht(o, t, l);
}
we = he.slice, m = { __e: function(t, e, n, i) {
  for (var r, o, l; e = e.__; ) if ((r = e.__c) && !r.__) try {
    if ((o = r.constructor) && o.getDerivedStateFromError != null && (r.setState(o.getDerivedStateFromError(t)), l = r.__d), r.componentDidCatch != null && (r.componentDidCatch(t, i || {}), l = r.__d), l) return r.__E = r;
  } catch (a) {
    t = a;
  }
  throw t;
} }, st = 0, lt = function(t) {
  return t != null && t.constructor === void 0;
}, ee.prototype.setState = function(t, e) {
  var n;
  n = this.__s != null && this.__s != this.state ? this.__s : this.__s = R({}, this.state), typeof t == "function" && (t = t(R({}, n), this.props)), t && R(n, t), t != null && this.__v && (e && this._sb.push(e), Ge(this));
}, ee.prototype.forceUpdate = function(t) {
  this.__v && (this.__e = !0, t && this.__h.push(t), Ge(this));
}, ee.prototype.render = D, F = [], at = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, ct = function(t, e) {
  return t.__v.__b - e.__v.__b;
}, ve.__r = 0, ut = /(PointerCapture)$|Capture$/i, Ue = 0, Ce = Je(!1), Ne = Je(!0);
var Bt = 0;
function f(t, e, n, i, r, o) {
  e || (e = {});
  var l, a, u = e;
  if ("ref" in u) for (a in u = {}, e) a == "ref" ? l = e[a] : u[a] = e[a];
  var c = { type: t, props: u, key: n, ref: l, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --Bt, __i: -1, __u: 0, __source: r, __self: o };
  if (typeof t == "function" && (l = t.defaultProps)) for (a in l) u[a] === void 0 && (u[a] = l[a]);
  return m.vnode && m.vnode(c), c;
}
var oe, w, Te, Ye, me = 0, yt = [], k = m, Ze = k.__b, Qe = k.__r, Xe = k.diffed, et = k.__c, tt = k.unmount, nt = k.__;
function Le(t, e) {
  k.__h && k.__h(w, t, me || e), me = 0;
  var n = w.__H || (w.__H = { __: [], __h: [] });
  return t >= n.__.length && n.__.push({}), n.__[t];
}
function A(t) {
  return me = 1, Vt(xt, t);
}
function Vt(t, e, n) {
  var i = Le(oe++, 2);
  if (i.t = t, !i.__c && (i.__ = [xt(void 0, e), function(a) {
    var u = i.__N ? i.__N[0] : i.__[0], c = i.t(u, a);
    u !== c && (i.__N = [c, i.__[1]], i.__c.setState({}));
  }], i.__c = w, !w.__f)) {
    var r = function(a, u, c) {
      if (!i.__c.__H) return !0;
      var _ = i.__c.__H.__.filter(function(p) {
        return p.__c;
      });
      if (_.every(function(p) {
        return !p.__N;
      })) return !o || o.call(this, a, u, c);
      var s = i.__c.props !== a;
      return _.some(function(p) {
        if (p.__N) {
          var d = p.__[0];
          p.__ = p.__N, p.__N = void 0, d !== p.__[0] && (s = !0);
        }
      }), o && o.call(this, a, u, c) || s;
    };
    w.__f = !0;
    var o = w.shouldComponentUpdate, l = w.componentWillUpdate;
    w.componentWillUpdate = function(a, u, c) {
      if (this.__e) {
        var _ = o;
        o = void 0, r(a, u, c), o = _;
      }
      l && l.call(this, a, u, c);
    }, w.shouldComponentUpdate = r;
  }
  return i.__N || i.__;
}
function X(t, e) {
  var n = Le(oe++, 3);
  !k.__s && bt(n.__H, e) && (n.__ = t, n.u = e, w.__H.__h.push(n));
}
function q(t) {
  return me = 5, Fe(function() {
    return { current: t };
  }, []);
}
function Fe(t, e) {
  var n = Le(oe++, 7);
  return bt(n.__H, e) && (n.__ = t(), n.__H = e, n.__h = t), n.__;
}
function qt() {
  for (var t; t = yt.shift(); ) {
    var e = t.__H;
    if (t.__P && e) try {
      e.__h.some(de), e.__h.some(Pe), e.__h = [];
    } catch (n) {
      e.__h = [], k.__e(n, t.__v);
    }
  }
}
k.__b = function(t) {
  w = null, Ze && Ze(t);
}, k.__ = function(t, e) {
  t && e.__k && e.__k.__m && (t.__m = e.__k.__m), nt && nt(t, e);
}, k.__r = function(t) {
  Qe && Qe(t), oe = 0;
  var e = (w = t.__c).__H;
  e && (Te === w ? (e.__h = [], w.__h = [], e.__.some(function(n) {
    n.__N && (n.__ = n.__N), n.u = n.__N = void 0;
  })) : (e.__h.some(de), e.__h.some(Pe), e.__h = [], oe = 0)), Te = w;
}, k.diffed = function(t) {
  Xe && Xe(t);
  var e = t.__c;
  e && e.__H && (e.__H.__h.length && (yt.push(e) !== 1 && Ye === k.requestAnimationFrame || ((Ye = k.requestAnimationFrame) || jt)(qt)), e.__H.__.some(function(n) {
    n.u && (n.__H = n.u), n.u = void 0;
  })), Te = w = null;
}, k.__c = function(t, e) {
  e.some(function(n) {
    try {
      n.__h.some(de), n.__h = n.__h.filter(function(i) {
        return !i.__ || Pe(i);
      });
    } catch (i) {
      e.some(function(r) {
        r.__h && (r.__h = []);
      }), e = [], k.__e(i, n.__v);
    }
  }), et && et(t, e);
}, k.unmount = function(t) {
  tt && tt(t);
  var e, n = t.__c;
  n && n.__H && (n.__H.__.some(function(i) {
    try {
      de(i);
    } catch (r) {
      e = r;
    }
  }), n.__H = void 0, e && k.__e(e, n.__v));
};
var it = typeof requestAnimationFrame == "function";
function jt(t) {
  var e, n = function() {
    clearTimeout(i), it && cancelAnimationFrame(e), setTimeout(t);
  }, i = setTimeout(n, 35);
  it && (e = requestAnimationFrame(n));
}
function de(t) {
  var e = w, n = t.__c;
  typeof n == "function" && (t.__c = void 0, n()), w = e;
}
function Pe(t) {
  var e = w;
  t.__c = t.__(), w = e;
}
function bt(t, e) {
  return !t || t.length !== e.length || e.some(function(n, i) {
    return n !== t[i];
  });
}
function xt(t, e) {
  return typeof e == "function" ? e(t) : e;
}
var Gt = Symbol.for("preact-signals");
function $e() {
  if (H > 1)
    H--;
  else {
    for (var t, e = !1; te !== void 0; ) {
      var n = te;
      for (te = void 0, Oe++; n !== void 0; ) {
        var i = n.o;
        if (n.o = void 0, n.f &= -3, !(8 & n.f) && $t(n)) try {
          n.c();
        } catch (r) {
          e || (t = r, e = !0);
        }
        n = i;
      }
    }
    if (Oe = 0, H--, e) throw t;
  }
}
function Kt(t) {
  if (H > 0) return t();
  H++;
  try {
    return t();
  } finally {
    $e();
  }
}
var v = void 0;
function wt(t) {
  var e = v;
  v = void 0;
  try {
    return t();
  } finally {
    v = e;
  }
}
var te = void 0, H = 0, Oe = 0, ge = 0;
function kt(t) {
  if (v !== void 0) {
    var e = t.n;
    if (e === void 0 || e.t !== v)
      return e = { i: 0, S: t, p: v.s, n: void 0, t: v, e: void 0, x: void 0, r: e }, v.s !== void 0 && (v.s.n = e), v.s = e, t.n = e, 32 & v.f && t.S(e), e;
    if (e.i === -1)
      return e.i = 0, e.n !== void 0 && (e.n.p = e.p, e.p !== void 0 && (e.p.n = e.n), e.p = v.s, e.n = void 0, v.s.n = e, v.s = e), e;
  }
}
function S(t, e) {
  this.v = t, this.i = 0, this.n = void 0, this.t = void 0, this.W = e?.watched, this.Z = e?.unwatched, this.name = e?.name;
}
S.prototype.brand = Gt;
S.prototype.h = function() {
  return !0;
};
S.prototype.S = function(t) {
  var e = this, n = this.t;
  n !== t && t.e === void 0 && (t.x = n, this.t = t, n !== void 0 ? n.e = t : wt(function() {
    var i;
    (i = e.W) == null || i.call(e);
  }));
};
S.prototype.U = function(t) {
  var e = this;
  if (this.t !== void 0) {
    var n = t.e, i = t.x;
    n !== void 0 && (n.x = i, t.e = void 0), i !== void 0 && (i.e = n, t.x = void 0), t === this.t && (this.t = i, i === void 0 && wt(function() {
      var r;
      (r = e.Z) == null || r.call(e);
    }));
  }
};
S.prototype.subscribe = function(t) {
  var e = this;
  return re(function() {
    var n = e.value, i = v;
    v = void 0;
    try {
      t(n);
    } finally {
      v = i;
    }
  }, { name: "sub" });
};
S.prototype.valueOf = function() {
  return this.value;
};
S.prototype.toString = function() {
  return this.value + "";
};
S.prototype.toJSON = function() {
  return this.value;
};
S.prototype.peek = function() {
  var t = v;
  v = void 0;
  try {
    return this.value;
  } finally {
    v = t;
  }
};
Object.defineProperty(S.prototype, "value", { get: function() {
  var t = kt(this);
  return t !== void 0 && (t.i = this.i), this.v;
}, set: function(t) {
  if (t !== this.v) {
    if (Oe > 100) throw new Error("Cycle detected");
    this.v = t, this.i++, ge++, H++;
    try {
      for (var e = this.t; e !== void 0; e = e.x) e.t.N();
    } finally {
      $e();
    }
  }
} });
function C(t, e) {
  return new S(t, e);
}
function $t(t) {
  for (var e = t.s; e !== void 0; e = e.n) if (e.S.i !== e.i || !e.S.h() || e.S.i !== e.i) return !0;
  return !1;
}
function St(t) {
  for (var e = t.s; e !== void 0; e = e.n) {
    var n = e.S.n;
    if (n !== void 0 && (e.r = n), e.S.n = e, e.i = -1, e.n === void 0) {
      t.s = e;
      break;
    }
  }
}
function Tt(t) {
  for (var e = t.s, n = void 0; e !== void 0; ) {
    var i = e.p;
    e.i === -1 ? (e.S.U(e), i !== void 0 && (i.n = e.n), e.n !== void 0 && (e.n.p = i)) : n = e, e.S.n = e.r, e.r !== void 0 && (e.r = void 0), e = i;
  }
  t.s = n;
}
function W(t, e) {
  S.call(this, void 0), this.x = t, this.s = void 0, this.g = ge - 1, this.f = 4, this.W = e?.watched, this.Z = e?.unwatched, this.name = e?.name;
}
W.prototype = new S();
W.prototype.h = function() {
  if (this.f &= -3, 1 & this.f) return !1;
  if ((36 & this.f) == 32 || (this.f &= -5, this.g === ge)) return !0;
  if (this.g = ge, this.f |= 1, this.i > 0 && !$t(this))
    return this.f &= -2, !0;
  var t = v;
  try {
    St(this), v = this;
    var e = this.x();
    (16 & this.f || this.v !== e || this.i === 0) && (this.v = e, this.f &= -17, this.i++);
  } catch (n) {
    this.v = n, this.f |= 16, this.i++;
  }
  return v = t, Tt(this), this.f &= -2, !0;
};
W.prototype.S = function(t) {
  if (this.t === void 0) {
    this.f |= 36;
    for (var e = this.s; e !== void 0; e = e.n) e.S.S(e);
  }
  S.prototype.S.call(this, t);
};
W.prototype.U = function(t) {
  if (this.t !== void 0 && (S.prototype.U.call(this, t), this.t === void 0)) {
    this.f &= -33;
    for (var e = this.s; e !== void 0; e = e.n) e.S.U(e);
  }
};
W.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 6;
    for (var t = this.t; t !== void 0; t = t.x) t.t.N();
  }
};
Object.defineProperty(W.prototype, "value", { get: function() {
  if (1 & this.f) throw new Error("Cycle detected");
  var t = kt(this);
  if (this.h(), t !== void 0 && (t.i = this.i), 16 & this.f) throw this.v;
  return this.v;
} });
function ye(t, e) {
  return new W(t, e);
}
function It(t) {
  var e = t.u;
  if (t.u = void 0, typeof e == "function") {
    H++;
    var n = v;
    v = void 0;
    try {
      e();
    } catch (i) {
      throw t.f &= -2, t.f |= 8, We(t), i;
    } finally {
      v = n, $e();
    }
  }
}
function We(t) {
  for (var e = t.s; e !== void 0; e = e.n) e.S.U(e);
  t.x = void 0, t.s = void 0, It(t);
}
function Jt(t) {
  if (v !== this) throw new Error("Out-of-order effect");
  Tt(this), v = t, this.f &= -2, 8 & this.f && We(this), $e();
}
function K(t, e) {
  this.x = t, this.u = void 0, this.s = void 0, this.o = void 0, this.f = 32, this.name = e?.name;
}
K.prototype.c = function() {
  var t = this.S();
  try {
    if (8 & this.f || this.x === void 0) return;
    var e = this.x();
    typeof e == "function" && (this.u = e);
  } finally {
    t();
  }
};
K.prototype.S = function() {
  if (1 & this.f) throw new Error("Cycle detected");
  this.f |= 1, this.f &= -9, It(this), St(this), H++;
  var t = v;
  return v = this, Jt.bind(this, t);
};
K.prototype.N = function() {
  2 & this.f || (this.f |= 2, this.o = te, te = this);
};
K.prototype.d = function() {
  this.f |= 8, 1 & this.f || We(this);
};
K.prototype.dispose = function() {
  this.d();
};
function re(t, e) {
  var n = new K(t, e);
  try {
    n.c();
  } catch (r) {
    throw n.d(), r;
  }
  var i = n.d.bind(n);
  return i[Symbol.dispose] = i, i;
}
var Ct, ce, Yt = typeof window < "u" && !!window.__PREACT_SIGNALS_DEVTOOLS__, Nt = [];
re(function() {
  Ct = this.N;
})();
function J(t, e) {
  m[t] = e.bind(null, m[t] || function() {
  });
}
function be(t) {
  if (ce) {
    var e = ce;
    ce = void 0, e();
  }
  ce = t && t.S();
}
function Et(t) {
  var e = this, n = t.data, i = Pt(n);
  i.value = n;
  var r = Fe(function() {
    for (var a = e, u = e.__v; u = u.__; ) if (u.__c) {
      u.__c.__$f |= 4;
      break;
    }
    var c = ye(function() {
      var d = i.value.value;
      return d === 0 ? 0 : d === !0 ? "" : d || "";
    }), _ = ye(function() {
      return !Array.isArray(c.value) && !lt(c.value);
    }), s = re(function() {
      if (this.N = Ot, _.value) {
        var d = c.value;
        a.__v && a.__v.__e && a.__v.__e.nodeType === 3 && (a.__v.__e.data = d);
      }
    }), p = e.__$u.d;
    return e.__$u.d = function() {
      s(), p.call(this);
    }, [_, c];
  }, []), o = r[0], l = r[1];
  return o.value ? l.peek() : l.value;
}
Et.displayName = "ReactiveTextNode";
Object.defineProperties(S.prototype, { constructor: { configurable: !0, value: void 0 }, type: { configurable: !0, value: Et }, props: { configurable: !0, get: function() {
  return { data: this };
} }, __b: { configurable: !0, value: 1 } });
J("__b", function(t, e) {
  if (typeof e.type == "string") {
    var n, i = e.props;
    for (var r in i) if (r !== "children") {
      var o = i[r];
      o instanceof S && (n || (e.__np = n = {}), n[r] = o, i[r] = o.peek());
    }
  }
  t(e);
});
J("__r", function(t, e) {
  if (t(e), e.type !== D) {
    be();
    var n, i = e.__c;
    i && (i.__$f &= -2, (n = i.__$u) === void 0 && (i.__$u = n = (function(r, o) {
      var l;
      return re(function() {
        l = this;
      }, { name: o }), l.c = r, l;
    })(function() {
      var r;
      Yt && ((r = n.y) == null || r.call(n)), i.__$f |= 1, i.setState({});
    }, typeof e.type == "function" ? e.type.displayName || e.type.name : ""))), be(n);
  }
});
J("__e", function(t, e, n, i) {
  be(), t(e, n, i);
});
J("diffed", function(t, e) {
  be();
  var n;
  if (typeof e.type == "string" && (n = e.__e)) {
    var i = e.__np, r = e.props;
    if (i) {
      var o = n.U;
      if (o) for (var l in o) {
        var a = o[l];
        a !== void 0 && !(l in i) && (a.d(), o[l] = void 0);
      }
      else
        o = {}, n.U = o;
      for (var u in i) {
        var c = o[u], _ = i[u];
        c === void 0 ? (c = Zt(n, u, _), o[u] = c) : c.o(_, r);
      }
      for (var s in i) r[s] = i[s];
    }
  }
  t(e);
});
function Zt(t, e, n, i) {
  var r = e in t && t.ownerSVGElement === void 0, o = C(n), l = n.peek();
  return { o: function(a, u) {
    o.value = a, l = a.peek();
  }, d: re(function() {
    this.N = Ot;
    var a = o.value.value;
    l !== a ? (l = void 0, r ? t[e] = a : a != null && (a !== !1 || e[4] === "-") ? t.setAttribute(e, a) : t.removeAttribute(e)) : l = void 0;
  }) };
}
J("unmount", function(t, e) {
  if (typeof e.type == "string") {
    var n = e.__e;
    if (n) {
      var i = n.U;
      if (i) {
        n.U = void 0;
        for (var r in i) {
          var o = i[r];
          o && o.d();
        }
      }
    }
    e.__np = void 0;
  } else {
    var l = e.__c;
    if (l) {
      var a = l.__$u;
      a && (l.__$u = void 0, a.d());
    }
  }
  t(e);
});
J("__h", function(t, e, n, i) {
  (i < 3 || i === 9) && (e.__$f |= 2), t(e, n, i);
});
ee.prototype.shouldComponentUpdate = function(t, e) {
  if (this.__R) return !0;
  var n = this.__$u, i = n && n.s !== void 0;
  for (var r in e) return !0;
  if (this.__f || typeof this.u == "boolean" && this.u === !0) {
    var o = 2 & this.__$f;
    if (!(i || o || 4 & this.__$f) || 1 & this.__$f) return !0;
  } else if (!(i || 4 & this.__$f) || 3 & this.__$f) return !0;
  for (var l in t) if (l !== "__source" && t[l] !== this.props[l]) return !0;
  for (var a in this.props) if (!(a in t)) return !0;
  return !1;
};
function Pt(t, e) {
  return Fe(function() {
    return C(t, e);
  }, []);
}
var Qt = function(t) {
  queueMicrotask(function() {
    queueMicrotask(t);
  });
};
function Xt() {
  Kt(function() {
    for (var t; t = Nt.shift(); ) Ct.call(t);
  });
}
function Ot() {
  Nt.push(this) === 1 && (m.requestAnimationFrame || Qt)(Xt);
}
const N = C(!1), ot = C(!1), T = C([]), x = C(null), G = C(null), O = C(null), z = C(null), Q = C(""), ne = C(!1), xe = C(!1), I = C({
  primaryColor: "#3ECF8E",
  position: "bottom-right",
  welcomeMessage: "Hi! How can we help you?",
  workspaceName: null,
  showBranding: !0,
  requireEmail: !1,
  pusherKey: null,
  pusherCluster: null,
  offlineFormTimeout: null,
  pageVisibilityMode: "exclude",
  pageVisibilityPatterns: []
}), Mt = C(!1), en = ye(
  () => I.value.requireEmail && !z.value && !x.value
), tn = ye(() => !!x.value), At = "guddesk_state";
function Be() {
  try {
    localStorage.setItem(
      At,
      JSON.stringify({
        conversationId: x.value,
        visitorId: G.value,
        visitorToken: O.value,
        visitorEmail: z.value
      })
    );
  } catch {
  }
}
function nn() {
  try {
    const t = localStorage.getItem(At);
    if (!t) return;
    const e = JSON.parse(t);
    e.conversationId && (x.value = e.conversationId), e.visitorId && (G.value = e.visitorId), e.visitorToken && (O.value = e.visitorToken), e.visitorEmail && (z.value = e.visitorEmail);
  } catch {
  }
}
let se = "", Rt = "";
function on(t, e) {
  se = t, Rt = e.replace(/\/$/, "");
}
async function Y(t, e = {}) {
  const n = {
    "Content-Type": "application/json",
    ...e.headers
  };
  O.value && (n["x-visitor-token"] = O.value);
  const i = await fetch(`${Rt}${t}`, { ...e, headers: n });
  if (!i.ok) {
    const r = await i.json().catch(() => ({ error: "Request failed" }));
    throw new Error(r.error || "Request failed");
  }
  return i.json();
}
async function rn() {
  const t = await Y(
    `/api/widget/config?appId=${encodeURIComponent(se)}`
  );
  I.value = t, Mt.value = !0;
}
async function sn() {
  if (O.value && G.value) return;
  const t = await Y(
    "/api/widget/auth",
    { method: "POST", body: JSON.stringify({ appId: se }) }
  );
  G.value = t.visitorId, O.value = t.visitorToken, Be();
}
async function Ve(t) {
  const e = await Y(
    "/api/widget/visitors",
    {
      method: "POST",
      body: JSON.stringify({
        appId: se,
        visitorToken: O.value,
        externalId: t.userId,
        name: t.name,
        email: t.email,
        metadata: t.metadata
      })
    }
  );
  G.value = e.visitorId, O.value = e.visitorToken, t.email && (z.value = t.email), Be();
}
let ln = 0;
function Ut(t) {
  const e = `_opt_${++ln}`, n = {
    id: e,
    body: t,
    type: "VISITOR",
    senderName: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    _sending: !0
  };
  return T.value = [...T.value, n], e;
}
function Me(t, e) {
  e ? T.value = T.value.map((n) => n.id === t ? e : n) : T.value = T.value.map(
    (n) => n.id === t ? { ...n, _sending: !1 } : n
  );
}
async function an(t) {
  const e = Ut(t);
  try {
    const n = await Y("/api/widget/conversations", {
      method: "POST",
      body: JSON.stringify({
        appId: se,
        visitorToken: O.value,
        message: t,
        visitorName: null,
        visitorEmail: z.value
      })
    });
    x.value = n.conversationId, G.value = n.visitorId, O.value = n.visitorToken, T.value = n.messages, Be();
  } catch {
    Me(e, null);
  }
}
async function cn(t) {
  if (!x.value)
    return an(t);
  const e = Ut(t);
  try {
    const n = await Y(
      `/api/widget/conversations/${x.value}/messages`,
      { method: "POST", body: JSON.stringify({ message: t }) }
    );
    Me(e, n);
  } catch {
    Me(e, null);
  }
}
async function ue() {
  if (!x.value) return;
  const t = await Y(
    `/api/widget/conversations/${x.value}/messages`
  );
  T.value = t.messages;
}
function un(t) {
  const e = t.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/\*\*/g, "{{GLOBSTAR}}").replace(/\*/g, "[^/]*").replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${e}$`);
}
function fn(t, e, n) {
  if (!n || n.length === 0) return !0;
  const i = n.some((r) => {
    try {
      return un(r).test(t);
    } catch {
      return !1;
    }
  });
  return e === "exclude" ? !i : i;
}
let E = null, P = null, V = null, _e = null;
const dn = 8e3;
async function _n(t, e, n) {
  const { default: i } = await import("pusher-js"), r = new i(t, {
    cluster: e,
    channelAuthorization: {
      endpoint: n,
      transport: "ajax",
      customHandler: ({ channelName: o, socketId: l }, a) => {
        fetch(n, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-visitor-token": O.value ?? ""
          },
          body: new URLSearchParams({
            socket_id: l,
            channel_name: o
          }).toString()
        }).then(async (u) => {
          if (!u.ok) {
            a(
              new Error(`Pusher auth failed: ${u.status}`),
              null
            );
            return;
          }
          const c = await u.json();
          a(null, c);
        }).catch((u) => a(u, null));
      }
    }
  });
  return await new Promise((o, l) => {
    const a = setTimeout(() => {
      u();
      try {
        r.disconnect();
      } catch {
      }
      l(new Error("Pusher connection timeout"));
    }, dn);
    function u() {
      clearTimeout(a), r.connection.unbind("connected", c), r.connection.unbind("error", _), r.connection.unbind("unavailable", _), r.connection.unbind("failed", _);
    }
    function c() {
      u(), o();
    }
    function _(s) {
      u();
      try {
        r.disconnect();
      } catch {
      }
      l(s instanceof Error ? s : new Error("Pusher connection error"));
    }
    r.connection.bind("connected", c), r.connection.bind("error", _), r.connection.bind("unavailable", _), r.connection.bind("failed", _);
  }), E = r, E;
}
function pn(t) {
  _e = t, E && E.connection.bind("connected", () => {
    _e && _e(), x.value && Ae();
  });
}
function Ae() {
  if (!E || !x.value) return;
  P && (P.unbind_all(), E.unsubscribe(P.name));
  const t = `private-visitor-${x.value}`;
  P = E.subscribe(t), P.bind("message:created", (e) => {
    T.value.some((n) => n.id === e.id) || (T.value = [...T.value, e]);
  }), P.bind("typing:start", () => {
    ne.value = !0, V && clearTimeout(V), V = setTimeout(() => {
      ne.value = !1;
    }, 4e3);
  }), P.bind("typing:stop", () => {
    ne.value = !1, V && (clearTimeout(V), V = null);
  });
}
function Ie() {
  return E?.connection?.state === "connected";
}
function hn() {
  P && (P.unbind_all(), E?.unsubscribe(P.name), P = null), E && (E.disconnect(), E = null), _e = null;
}
function vn(t, e) {
  const n = e === "bottom-right";
  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .fc-container {
      position: fixed;
      bottom: 20px;
      ${n ? "right: 20px;" : "left: 20px;"}
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: ${n ? "flex-end" : "flex-start"};
    }

    .fc-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${t};
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .fc-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    .fc-window {
      width: 370px;
      max-height: 520px;
      border-radius: 16px;
      overflow: hidden;
      background: white;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
      animation: fc-slide-up 0.25s ease-out;
    }

    @keyframes fc-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fc-header {
      background: ${t};
      color: white;
      padding: 16px;
    }
    .fc-header-title {
      font-size: 15px;
      font-weight: 600;
    }
    .fc-header-subtitle {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 2px;
    }
    .fc-header-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      opacity: 0.8;
      padding: 4px;
    }
    .fc-header-close:hover { opacity: 1; }

    .fc-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 200px;
      max-height: 320px;
    }

    .fc-msg-row {
      display: flex;
      flex-direction: column;
    }
    .fc-msg-row-visitor {
      align-items: flex-end;
    }
    .fc-msg-row-agent {
      align-items: flex-start;
    }

    .fc-msg {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .fc-msg-visitor {
      background: ${t};
      color: white;
      border-bottom-right-radius: 4px;
    }
    .fc-msg-agent {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    .fc-msg-sender {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .fc-msg-time {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 2px;
    }
    .fc-msg-sending {
      opacity: 0.7;
    }
    .fc-sending-indicator {
      display: inline-flex;
      gap: 2px;
      align-items: center;
    }
    .fc-sending-dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.5;
      animation: fc-sending-pulse 1s infinite;
    }
    .fc-sending-dot:nth-child(2) { animation-delay: 0.15s; }
    .fc-sending-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes fc-sending-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .fc-typing {
      align-self: flex-start;
      padding: 8px 12px;
      background: #f3f4f6;
      border-radius: 12px;
      font-size: 13px;
      color: #6b7280;
    }
    .fc-typing-dots span {
      animation: fc-blink 1.4s infinite both;
    }
    .fc-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .fc-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes fc-blink {
      0%, 80%, 100% { opacity: 0.3; }
      40% { opacity: 1; }
    }

    .fc-input-area {
      border-top: 1px solid #e5e7eb;
      padding: 12px;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .fc-input {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      resize: none;
      min-height: 36px;
      max-height: 80px;
      line-height: 1.4;
    }
    .fc-input:focus {
      border-color: ${t};
    }
    .fc-send-btn {
      background: ${t};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
    }
    .fc-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .fc-branding {
      text-align: center;
      padding: 6px;
      font-size: 10px;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
    }
    .fc-branding a {
      color: #6b7280;
      text-decoration: none;
    }
    .fc-branding a:hover { text-decoration: underline; }

    .fc-prechat {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .fc-prechat label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    .fc-prechat input {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
    }
    .fc-prechat input:focus {
      border-color: ${t};
    }
    .fc-prechat button {
      background: ${t};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }

    .fc-offline-form {
      padding: 16px;
      animation: fc-slide-up 0.2s ease-out;
    }
    .fc-offline-header {
      margin-bottom: 12px;
    }
    .fc-offline-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    .fc-offline-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
    .fc-offline-fields {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .fc-offline-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .fc-offline-field label {
      font-size: 12px;
      font-weight: 500;
      color: #374151;
    }
    .fc-offline-field input,
    .fc-offline-field textarea {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      resize: none;
    }
    .fc-offline-field input:focus,
    .fc-offline-field textarea:focus {
      border-color: ${t};
    }
    .fc-offline-error {
      font-size: 12px;
      color: #ef4444;
    }
    .fc-offline-submit {
      background: ${t};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .fc-offline-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .fc-offline-dismiss {
      background: none;
      border: none;
      color: #6b7280;
      font-size: 12px;
      cursor: pointer;
      text-align: center;
      padding: 6px;
      width: 100%;
    }
    .fc-offline-dismiss:hover {
      color: #374151;
    }
    .fc-offline-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 0;
      gap: 8px;
    }
    .fc-offline-success-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    .fc-offline-success-text {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
    }
    .fc-offline-success-text strong {
      color: #374151;
    }

    @media (max-width: 440px) {
      .fc-window {
        width: calc(100vw - 24px);
        max-height: calc(100vh - 100px);
        border-radius: 12px;
      }
      .fc-container {
        bottom: 12px;
        ${n ? "right: 12px;" : "left: 12px;"}
      }
    }
  `;
}
const mn = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', gn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', yn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function bn() {
  return /* @__PURE__ */ f("div", { class: "fc-header", style: { position: "relative" }, children: [
    /* @__PURE__ */ f("div", { class: "fc-header-title", children: I.value.workspaceName || "Support" }),
    /* @__PURE__ */ f("div", { class: "fc-header-subtitle", children: "We typically reply in a few minutes" }),
    /* @__PURE__ */ f(
      "button",
      {
        class: "fc-header-close",
        onClick: () => N.value = !1,
        "aria-label": "Close chat",
        dangerouslySetInnerHTML: { __html: gn }
      }
    )
  ] });
}
function xn(t) {
  try {
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function rt() {
  const t = q(null);
  return X(() => {
    t.current?.scrollIntoView({ behavior: "smooth" });
  }, [T.value.length, ne.value]), tn.value ? /* @__PURE__ */ f("div", { class: "fc-messages", children: [
    T.value.map((e) => /* @__PURE__ */ f(
      "div",
      {
        class: `fc-msg-row ${e.type === "VISITOR" ? "fc-msg-row-visitor" : "fc-msg-row-agent"}`,
        children: [
          e.type !== "VISITOR" && e.senderName && /* @__PURE__ */ f("div", { class: "fc-msg-sender", children: e.senderName }),
          /* @__PURE__ */ f(
            "div",
            {
              class: `fc-msg ${e.type === "VISITOR" ? "fc-msg-visitor" : "fc-msg-agent"}${e._sending ? " fc-msg-sending" : ""}`,
              children: [
                e.body,
                /* @__PURE__ */ f("div", { class: "fc-msg-time", children: e._sending ? /* @__PURE__ */ f("span", { class: "fc-sending-indicator", children: [
                  /* @__PURE__ */ f("span", { class: "fc-sending-dot" }),
                  /* @__PURE__ */ f("span", { class: "fc-sending-dot" }),
                  /* @__PURE__ */ f("span", { class: "fc-sending-dot" })
                ] }) : xn(e.createdAt) })
              ]
            }
          )
        ]
      },
      e.id
    )),
    ne.value && /* @__PURE__ */ f("div", { class: "fc-typing", children: /* @__PURE__ */ f("span", { class: "fc-typing-dots", children: [
      /* @__PURE__ */ f("span", { children: "." }),
      /* @__PURE__ */ f("span", { children: "." }),
      /* @__PURE__ */ f("span", { children: "." })
    ] }) }),
    /* @__PURE__ */ f("div", { ref: t })
  ] }) : /* @__PURE__ */ f("div", { class: "fc-messages", children: /* @__PURE__ */ f("div", { class: "fc-msg fc-msg-agent", children: I.value.welcomeMessage }) });
}
function wn() {
  const t = q(null);
  async function e() {
    const i = Q.value.trim();
    !i || ot.value || (Q.value = "", await cn(i), t.current?.focus());
  }
  function n(i) {
    i.key === "Enter" && !i.shiftKey && (i.preventDefault(), e());
  }
  return /* @__PURE__ */ f("div", { class: "fc-input-area", children: [
    /* @__PURE__ */ f(
      "textarea",
      {
        ref: t,
        class: "fc-input",
        rows: 1,
        placeholder: "Type a message...",
        value: Q.value,
        onInput: (i) => {
          Q.value = i.target.value;
        },
        onKeyDown: n
      }
    ),
    /* @__PURE__ */ f(
      "button",
      {
        class: "fc-send-btn",
        onClick: e,
        disabled: !Q.value.trim() || ot.value,
        children: "Send"
      }
    )
  ] });
}
function kn() {
  const [t, e] = A(""), [n, i] = A(""), [r, o] = A(!1);
  async function l(a) {
    a.preventDefault();
    const u = t.trim();
    if (!u || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) {
      i("Please enter a valid email address.");
      return;
    }
    o(!0), i("");
    try {
      await Ve({ email: u }), z.value = u;
    } catch {
      i("Something went wrong. Please try again.");
    } finally {
      o(!1);
    }
  }
  return /* @__PURE__ */ f("form", { class: "fc-prechat", onSubmit: l, children: [
    /* @__PURE__ */ f("label", { children: "Enter your email to start chatting" }),
    /* @__PURE__ */ f(
      "input",
      {
        type: "email",
        placeholder: "you@example.com",
        value: t,
        onInput: (a) => e(a.target.value),
        required: !0
      }
    ),
    n && /* @__PURE__ */ f("div", { style: { color: "#ef4444", fontSize: "12px" }, children: n }),
    /* @__PURE__ */ f("button", { type: "submit", disabled: r, children: r ? "..." : "Start Chat" })
  ] });
}
function $n() {
  const [t, e] = A(""), [n, i] = A(z.value ?? ""), [r, o] = A(""), [l, a] = A(!1), [u, c] = A(!1), [_, s] = A("");
  async function p(h) {
    h.preventDefault();
    const $ = n.trim();
    if (!$ || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($)) {
      s("Please enter a valid email address.");
      return;
    }
    c(!0), s("");
    try {
      await Ve({
        email: $,
        name: t.trim() || void 0
      }), z.value = $, a(!0);
    } catch {
      s("Something went wrong. Please try again.");
    } finally {
      c(!1);
    }
  }
  function d() {
    xe.value = !1;
  }
  return l ? /* @__PURE__ */ f("div", { class: "fc-offline-form", children: /* @__PURE__ */ f("div", { class: "fc-offline-success", children: [
    /* @__PURE__ */ f("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: I.value.primaryColor, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ f("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
      /* @__PURE__ */ f("polyline", { points: "22 4 12 14.01 9 11.01" })
    ] }),
    /* @__PURE__ */ f("p", { class: "fc-offline-success-title", children: "Thanks! We'll be in touch." }),
    /* @__PURE__ */ f("p", { class: "fc-offline-success-text", children: [
      "We'll get back to you at ",
      /* @__PURE__ */ f("strong", { children: n }),
      " as soon as possible."
    ] }),
    /* @__PURE__ */ f("button", { class: "fc-offline-dismiss", onClick: d, children: "Continue chatting" })
  ] }) }) : /* @__PURE__ */ f("div", { class: "fc-offline-form", children: [
    /* @__PURE__ */ f("div", { class: "fc-offline-header", children: [
      /* @__PURE__ */ f("p", { class: "fc-offline-title", children: "We're not available right now" }),
      /* @__PURE__ */ f("p", { class: "fc-offline-subtitle", children: "Leave your details and we'll get back to you." })
    ] }),
    /* @__PURE__ */ f("form", { class: "fc-offline-fields", onSubmit: p, children: [
      /* @__PURE__ */ f("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ f("label", { children: "Name" }),
        /* @__PURE__ */ f(
          "input",
          {
            type: "text",
            placeholder: "Your name",
            value: t,
            onInput: (h) => e(h.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ f("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ f("label", { children: "Email *" }),
        /* @__PURE__ */ f(
          "input",
          {
            type: "email",
            placeholder: "you@example.com",
            value: n,
            onInput: (h) => i(h.target.value),
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ f("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ f("label", { children: "Message" }),
        /* @__PURE__ */ f(
          "textarea",
          {
            placeholder: "Anything else you'd like us to know?",
            rows: 3,
            value: r,
            onInput: (h) => o(h.target.value)
          }
        )
      ] }),
      _ && /* @__PURE__ */ f("div", { class: "fc-offline-error", children: _ }),
      /* @__PURE__ */ f("button", { type: "submit", class: "fc-offline-submit", disabled: u, children: u ? "Sending..." : "Leave a message" }),
      /* @__PURE__ */ f("button", { type: "button", class: "fc-offline-dismiss", onClick: d, children: "Continue chatting" })
    ] })
  ] });
}
function Sn() {
  return /* @__PURE__ */ f("div", { class: "fc-window", children: [
    /* @__PURE__ */ f(bn, {}),
    en.value ? /* @__PURE__ */ f(kn, {}) : xe.value ? /* @__PURE__ */ f(D, { children: [
      /* @__PURE__ */ f(rt, {}),
      /* @__PURE__ */ f($n, {})
    ] }) : /* @__PURE__ */ f(D, { children: [
      /* @__PURE__ */ f(rt, {}),
      /* @__PURE__ */ f(wn, {})
    ] }),
    I.value.showBranding && /* @__PURE__ */ f("div", { class: "fc-branding", children: [
      "Powered by",
      " ",
      /* @__PURE__ */ f("a", { href: "https://guddesk.com", target: "_blank", rel: "noopener", children: "GudDesk" })
    ] })
  ] });
}
function Tn() {
  return /* @__PURE__ */ f(
    "button",
    {
      class: "fc-bubble",
      onClick: () => N.value = !N.value,
      "aria-label": N.value ? "Close chat" : "Open chat",
      dangerouslySetInnerHTML: {
        __html: N.value ? yn : mn
      }
    }
  );
}
const In = 4e3;
function Cn({ appId: t, baseUrl: e, pusherKey: n, pusherCluster: i }) {
  const r = q(null), o = q(!1), l = q(null), a = q(0), u = Pt(!1);
  function c() {
    _(), r.current = setInterval(() => {
      x.value && N.value && ue().catch(() => {
      });
    }, In);
  }
  function _() {
    r.current && (clearInterval(r.current), r.current = null);
  }
  async function s(p, d) {
    if (!o.current) {
      o.current = !0;
      try {
        await _n(p, d, `${e}/api/pusher/auth`), x.value && Ae(), pn(() => {
          x.value && ue().catch(() => {
          });
        }), _();
      } catch {
        o.current = !1, c();
      }
    }
  }
  return X(() => (nn(), on(t, e), Promise.all([
    rn().catch(() => {
    }),
    sn().catch(() => {
    })
  ]).then(() => {
    if (!fn(
      window.location.pathname,
      I.value.pageVisibilityMode,
      I.value.pageVisibilityPatterns
    )) {
      u.value = !0;
      return;
    }
    x.value && ue().catch(() => {
    });
    const d = n || I.value.pusherKey, h = i || I.value.pusherCluster;
    d && h ? s(d, h) : c();
  }), () => {
    hn(), _();
  }), []), X(() => {
    x.value && (Ie() ? Ae() : r.current || c());
  }, [x.value]), X(() => {
    N.value && x.value && !Ie() ? (ue().catch(() => {
    }), c()) : !N.value && !Ie() && _();
  }, [N.value]), X(() => {
    const p = I.value.offlineFormTimeout;
    if (!p || !x.value) return;
    const d = T.value, h = d.filter((b) => b.type === "VISITOR").length;
    if (d.some((b) => b.type === "AGENT" || b.type === "BOT")) {
      xe.value = !1, l.current && (clearTimeout(l.current), l.current = null), a.current = h;
      return;
    }
    return h > a.current && (a.current = h, l.current && clearTimeout(l.current), l.current = setTimeout(() => {
      T.value.some((g) => g.type === "AGENT" || g.type === "BOT") || (xe.value = !0);
    }, p * 60 * 1e3)), () => {
      l.current && (clearTimeout(l.current), l.current = null);
    };
  }, [T.value, x.value, I.value.offlineFormTimeout]), !Mt.value || u.value ? null : /* @__PURE__ */ f(D, { children: [
    /* @__PURE__ */ f("style", { children: vn(I.value.primaryColor, I.value.position) }),
    /* @__PURE__ */ f("div", { class: "fc-container", children: [
      N.value && /* @__PURE__ */ f(Sn, {}),
      /* @__PURE__ */ f(Tn, {})
    ] })
  ] });
}
let ie = null;
function Nn() {
  const t = document.querySelectorAll("script[src]");
  for (let e = t.length - 1; e >= 0; e--) {
    const n = t[e].src;
    if (n.includes("guddesk") || n.includes("widget"))
      try {
        const i = new URL(n);
        return i.hostname === "cdn.guddesk.com" || i.hostname === "www.guddesk.com" ? "https://guddesk.com" : i.origin;
      } catch {
      }
  }
  return window.location.origin;
}
function Re(t) {
  if (ie) return;
  const e = t.appId;
  if (!e) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }
  const n = t.baseUrl || Nn(), i = document.createElement("div");
  i.id = "guddesk-widget", document.body.appendChild(i), ie = i.attachShadow({ mode: "open" }), gt(
    ft(Cn, {
      appId: e,
      baseUrl: n,
      pusherKey: t.pusherKey,
      pusherCluster: t.pusherCluster
    }),
    ie
  );
}
function En() {
  const t = document.getElementById("guddesk-widget");
  t && (gt(null, ie), t.remove(), ie = null);
}
const Pn = {
  init: Re,
  identify: (t) => Ve(t),
  open: () => {
    N.value = !0;
  },
  close: () => {
    N.value = !1;
  },
  destroy: En
};
window.GudDesk = Pn;
window.GudDeskSettings && (document.readyState === "loading" ? document.addEventListener(
  "DOMContentLoaded",
  () => Re(window.GudDeskSettings)
) : Re(window.GudDeskSettings));
export {
  Pn as default
};
