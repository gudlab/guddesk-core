var we, y, ut, ft, W, qe, dt, _t, pt, He, Ee, Oe, _e = {}, pe = [], Gt = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, xe = Array.isArray;
function H(t, e) {
  for (var n in e) t[n] = e[n];
  return t;
}
function De(t) {
  t && t.parentNode && t.parentNode.removeChild(t);
}
function ht(t, e, n) {
  var i, r, o, a = {};
  for (o in e) o == "key" ? i = e[o] : o == "ref" ? r = e[o] : a[o] = e[o];
  if (arguments.length > 2 && (a.children = arguments.length > 3 ? we.call(arguments, 2) : n), typeof t == "function" && t.defaultProps != null) for (o in t.defaultProps) a[o] === void 0 && (a[o] = t.defaultProps[o]);
  return fe(t, a, i, r, null);
}
function fe(t, e, n, i, r) {
  var o = { type: t, props: e, key: n, ref: i, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: r ?? ++ut, __i: -1, __u: 0 };
  return r == null && y.vnode != null && y.vnode(o), o;
}
function U(t) {
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
function qt(t) {
  if (t.__P && t.__d) {
    var e = t.__v, n = e.__e, i = [], r = [], o = H({}, e);
    o.__v = e.__v + 1, y.vnode && y.vnode(o), Ue(t.__P, o, e, t.__n, t.__P.namespaceURI, 32 & e.__u ? [n] : null, i, n ?? j(e), !!(32 & e.__u), r), o.__v = e.__v, o.__.__k[o.__i] = o, yt(i, o, r), e.__e = e.__ = null, o.__e != n && vt(o);
  }
}
function vt(t) {
  if ((t = t.__) != null && t.__c != null) return t.__e = t.__c.base = null, t.__k.some(function(e) {
    if (e != null && e.__e != null) return t.__e = t.__c.base = e.__e;
  }), vt(t);
}
function Ve(t) {
  (!t.__d && (t.__d = !0) && W.push(t) && !he.__r++ || qe != y.debounceRendering) && ((qe = y.debounceRendering) || dt)(he);
}
function he() {
  for (var t, e = 1; W.length; ) W.length > e && W.sort(_t), t = W.shift(), e = W.length, qt(t);
  he.__r = 0;
}
function mt(t, e, n, i, r, o, a, l, u, c, _) {
  var s, p, d, v, b, w, h, m = i && i.__k || pe, O = e.length;
  for (u = Vt(n, e, m, u, O), s = 0; s < O; s++) (d = n.__k[s]) != null && (p = d.__i != -1 && m[d.__i] || _e, d.__i = s, w = Ue(t, d, p, r, o, a, l, u, c, _), v = d.__e, d.ref && p.ref != d.ref && (p.ref && Le(p.ref, null, d), _.push(d.ref, d.__c || v, d)), b == null && v != null && (b = v), (h = !!(4 & d.__u)) || p.__k === d.__k ? u = gt(d, u, t, h) : typeof d.type == "function" && w !== void 0 ? u = w : v && (u = v.nextSibling), d.__u &= -7);
  return n.__e = b, u;
}
function Vt(t, e, n, i, r) {
  var o, a, l, u, c, _ = n.length, s = _, p = 0;
  for (t.__k = new Array(r), o = 0; o < r; o++) (a = e[o]) != null && typeof a != "boolean" && typeof a != "function" ? (typeof a == "string" || typeof a == "number" || typeof a == "bigint" || a.constructor == String ? a = t.__k[o] = fe(null, a, null, null, null) : xe(a) ? a = t.__k[o] = fe(U, { children: a }, null, null, null) : a.constructor === void 0 && a.__b > 0 ? a = t.__k[o] = fe(a.type, a.props, a.key, a.ref ? a.ref : null, a.__v) : t.__k[o] = a, u = o + p, a.__ = t, a.__b = t.__b + 1, l = null, (c = a.__i = jt(a, n, u, s)) != -1 && (s--, (l = n[c]) && (l.__u |= 2)), l == null || l.__v == null ? (c == -1 && (r > _ ? p-- : r < _ && p++), typeof a.type != "function" && (a.__u |= 4)) : c != u && (c == u - 1 ? p-- : c == u + 1 ? p++ : (c > u ? p-- : p++, a.__u |= 4))) : t.__k[o] = null;
  if (s) for (o = 0; o < _; o++) (l = n[o]) != null && (2 & l.__u) == 0 && (l.__e == i && (i = j(l)), wt(l, l));
  return i;
}
function gt(t, e, n, i) {
  var r, o;
  if (typeof t.type == "function") {
    for (r = t.__k, o = 0; r && o < r.length; o++) r[o] && (r[o].__ = t, e = gt(r[o], e, n, i));
    return e;
  }
  t.__e != e && (i && (e && t.type && !e.parentNode && (e = j(t)), n.insertBefore(t.__e, e || null)), e = t.__e);
  do
    e = e && e.nextSibling;
  while (e != null && e.nodeType == 8);
  return e;
}
function jt(t, e, n, i) {
  var r, o, a, l = t.key, u = t.type, c = e[n], _ = c != null && (2 & c.__u) == 0;
  if (c === null && l == null || _ && l == c.key && u == c.type) return n;
  if (i > (_ ? 1 : 0)) {
    for (r = n - 1, o = n + 1; r >= 0 || o < e.length; ) if ((c = e[a = r >= 0 ? r-- : o++]) != null && (2 & c.__u) == 0 && l == c.key && u == c.type) return a;
  }
  return -1;
}
function je(t, e, n) {
  e[0] == "-" ? t.setProperty(e, n ?? "") : t[e] = n == null ? "" : typeof n != "number" || Gt.test(e) ? n : n + "px";
}
function le(t, e, n, i, r) {
  var o, a;
  e: if (e == "style") if (typeof n == "string") t.style.cssText = n;
  else {
    if (typeof i == "string" && (t.style.cssText = i = ""), i) for (e in i) n && e in n || je(t.style, e, "");
    if (n) for (e in n) i && n[e] == i[e] || je(t.style, e, n[e]);
  }
  else if (e[0] == "o" && e[1] == "n") o = e != (e = e.replace(pt, "$1")), a = e.toLowerCase(), e = a in t || e == "onFocusOut" || e == "onFocusIn" ? a.slice(2) : e.slice(2), t.l || (t.l = {}), t.l[e + o] = n, n ? i ? n.u = i.u : (n.u = He, t.addEventListener(e, o ? Oe : Ee, o)) : t.removeEventListener(e, o ? Oe : Ee, o);
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
function Ke(t) {
  return function(e) {
    if (this.l) {
      var n = this.l[e.type + t];
      if (e.t == null) e.t = He++;
      else if (e.t < n.u) return;
      return n(y.event ? y.event(e) : e);
    }
  };
}
function Ue(t, e, n, i, r, o, a, l, u, c) {
  var _, s, p, d, v, b, w, h, m, O, F, X, Ge, ae, $e, N = e.type;
  if (e.constructor !== void 0) return null;
  128 & n.__u && (u = !!(32 & n.__u), o = [l = e.__e = n.__e]), (_ = y.__b) && _(e);
  e: if (typeof N == "function") try {
    if (h = e.props, m = "prototype" in N && N.prototype.render, O = (_ = N.contextType) && i[_.__c], F = _ ? O ? O.props.value : _.__ : i, n.__c ? w = (s = e.__c = n.__c).__ = s.__E : (m ? e.__c = s = new N(h, F) : (e.__c = s = new ee(h, F), s.constructor = N, s.render = Jt), O && O.sub(s), s.state || (s.state = {}), s.__n = i, p = s.__d = !0, s.__h = [], s._sb = []), m && s.__s == null && (s.__s = s.state), m && N.getDerivedStateFromProps != null && (s.__s == s.state && (s.__s = H({}, s.__s)), H(s.__s, N.getDerivedStateFromProps(h, s.__s))), d = s.props, v = s.state, s.__v = e, p) m && N.getDerivedStateFromProps == null && s.componentWillMount != null && s.componentWillMount(), m && s.componentDidMount != null && s.__h.push(s.componentDidMount);
    else {
      if (m && N.getDerivedStateFromProps == null && h !== d && s.componentWillReceiveProps != null && s.componentWillReceiveProps(h, F), e.__v == n.__v || !s.__e && s.shouldComponentUpdate != null && s.shouldComponentUpdate(h, s.__s, F) === !1) {
        e.__v != n.__v && (s.props = h, s.state = s.__s, s.__d = !1), e.__e = n.__e, e.__k = n.__k, e.__k.some(function(G) {
          G && (G.__ = e);
        }), pe.push.apply(s.__h, s._sb), s._sb = [], s.__h.length && a.push(s);
        break e;
      }
      s.componentWillUpdate != null && s.componentWillUpdate(h, s.__s, F), m && s.componentDidUpdate != null && s.__h.push(function() {
        s.componentDidUpdate(d, v, b);
      });
    }
    if (s.context = F, s.props = h, s.__P = t, s.__e = !1, X = y.__r, Ge = 0, m) s.state = s.__s, s.__d = !1, X && X(e), _ = s.render(s.props, s.state, s.context), pe.push.apply(s.__h, s._sb), s._sb = [];
    else do
      s.__d = !1, X && X(e), _ = s.render(s.props, s.state, s.context), s.state = s.__s;
    while (s.__d && ++Ge < 25);
    s.state = s.__s, s.getChildContext != null && (i = H(H({}, i), s.getChildContext())), m && !p && s.getSnapshotBeforeUpdate != null && (b = s.getSnapshotBeforeUpdate(d, v)), ae = _ != null && _.type === U && _.key == null ? bt(_.props.children) : _, l = mt(t, xe(ae) ? ae : [ae], e, n, i, r, o, a, l, u, c), s.base = e.__e, e.__u &= -161, s.__h.length && a.push(s), w && (s.__E = s.__ = null);
  } catch (G) {
    if (e.__v = null, u || o != null) if (G.then) {
      for (e.__u |= u ? 160 : 128; l && l.nodeType == 8 && l.nextSibling; ) l = l.nextSibling;
      o[o.indexOf(l)] = null, e.__e = l;
    } else {
      for ($e = o.length; $e--; ) De(o[$e]);
      Ae(e);
    }
    else e.__e = n.__e, e.__k = n.__k, G.then || Ae(e);
    y.__e(G, e, n);
  }
  else o == null && e.__v == n.__v ? (e.__k = n.__k, e.__e = n.__e) : l = e.__e = Kt(n.__e, e, n, i, r, o, a, u, c);
  return (_ = y.diffed) && _(e), 128 & e.__u ? void 0 : l;
}
function Ae(t) {
  t && (t.__c && (t.__c.__e = !0), t.__k && t.__k.some(Ae));
}
function yt(t, e, n) {
  for (var i = 0; i < n.length; i++) Le(n[i], n[++i], n[++i]);
  y.__c && y.__c(e, t), t.some(function(r) {
    try {
      t = r.__h, r.__h = [], t.some(function(o) {
        o.call(r);
      });
    } catch (o) {
      y.__e(o, r.__v);
    }
  });
}
function bt(t) {
  return typeof t != "object" || t == null || t.__b > 0 ? t : xe(t) ? t.map(bt) : H({}, t);
}
function Kt(t, e, n, i, r, o, a, l, u) {
  var c, _, s, p, d, v, b, w = n.props || _e, h = e.props, m = e.type;
  if (m == "svg" ? r = "http://www.w3.org/2000/svg" : m == "math" ? r = "http://www.w3.org/1998/Math/MathML" : r || (r = "http://www.w3.org/1999/xhtml"), o != null) {
    for (c = 0; c < o.length; c++) if ((d = o[c]) && "setAttribute" in d == !!m && (m ? d.localName == m : d.nodeType == 3)) {
      t = d, o[c] = null;
      break;
    }
  }
  if (t == null) {
    if (m == null) return document.createTextNode(h);
    t = document.createElementNS(r, m, h.is && h), l && (y.__m && y.__m(e, o), l = !1), o = null;
  }
  if (m == null) w === h || l && t.data == h || (t.data = h);
  else {
    if (o = o && we.call(t.childNodes), !l && o != null) for (w = {}, c = 0; c < t.attributes.length; c++) w[(d = t.attributes[c]).name] = d.value;
    for (c in w) d = w[c], c == "dangerouslySetInnerHTML" ? s = d : c == "children" || c in h || c == "value" && "defaultValue" in h || c == "checked" && "defaultChecked" in h || le(t, c, null, d, r);
    for (c in h) d = h[c], c == "children" ? p = d : c == "dangerouslySetInnerHTML" ? _ = d : c == "value" ? v = d : c == "checked" ? b = d : l && typeof d != "function" || w[c] === d || le(t, c, d, w[c], r);
    if (_) l || s && (_.__html == s.__html || _.__html == t.innerHTML) || (t.innerHTML = _.__html), e.__k = [];
    else if (s && (t.innerHTML = ""), mt(e.type == "template" ? t.content : t, xe(p) ? p : [p], e, n, i, m == "foreignObject" ? "http://www.w3.org/1999/xhtml" : r, o, a, o ? o[0] : n.__k && j(n, 0), l, u), o != null) for (c = o.length; c--; ) De(o[c]);
    l || (c = "value", m == "progress" && v == null ? t.removeAttribute("value") : v != null && (v !== t[c] || m == "progress" && !v || m == "option" && v != w[c]) && le(t, c, v, w[c], r), c = "checked", b != null && b != t[c] && le(t, c, b, w[c], r));
  }
  return t;
}
function Le(t, e, n) {
  try {
    if (typeof t == "function") {
      var i = typeof t.__u == "function";
      i && t.__u(), i && e == null || (t.__u = t(e));
    } else t.current = e;
  } catch (r) {
    y.__e(r, n);
  }
}
function wt(t, e, n) {
  var i, r;
  if (y.unmount && y.unmount(t), (i = t.ref) && (i.current && i.current != t.__e || Le(i, null, e)), (i = t.__c) != null) {
    if (i.componentWillUnmount) try {
      i.componentWillUnmount();
    } catch (o) {
      y.__e(o, e);
    }
    i.base = i.__P = null;
  }
  if (i = t.__k) for (r = 0; r < i.length; r++) i[r] && wt(i[r], e, n || typeof t.type != "function");
  n || De(t.__e), t.__c = t.__ = t.__e = void 0;
}
function Jt(t, e, n) {
  return this.constructor(t, n);
}
function xt(t, e, n) {
  var i, r, o, a;
  e == document && (e = document.documentElement), y.__ && y.__(t, e), r = (i = !1) ? null : e.__k, o = [], a = [], Ue(e, t = e.__k = ht(U, null, [t]), r || _e, _e, e.namespaceURI, r ? null : e.firstChild ? we.call(e.childNodes) : null, o, r ? r.__e : e.firstChild, i, a), yt(o, t, a);
}
we = pe.slice, y = { __e: function(t, e, n, i) {
  for (var r, o, a; e = e.__; ) if ((r = e.__c) && !r.__) try {
    if ((o = r.constructor) && o.getDerivedStateFromError != null && (r.setState(o.getDerivedStateFromError(t)), a = r.__d), r.componentDidCatch != null && (r.componentDidCatch(t, i || {}), a = r.__d), a) return r.__E = r;
  } catch (l) {
    t = l;
  }
  throw t;
} }, ut = 0, ft = function(t) {
  return t != null && t.constructor === void 0;
}, ee.prototype.setState = function(t, e) {
  var n;
  n = this.__s != null && this.__s != this.state ? this.__s : this.__s = H({}, this.state), typeof t == "function" && (t = t(H({}, n), this.props)), t && H(n, t), t != null && this.__v && (e && this._sb.push(e), Ve(this));
}, ee.prototype.forceUpdate = function(t) {
  this.__v && (this.__e = !0, t && this.__h.push(t), Ve(this));
}, ee.prototype.render = U, W = [], dt = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, _t = function(t, e) {
  return t.__v.__b - e.__v.__b;
}, he.__r = 0, pt = /(PointerCapture)$|Capture$/i, He = 0, Ee = Ke(!1), Oe = Ke(!0);
var oe, x, Te, Je, ve = 0, kt = [], k = y, Ye = k.__b, Xe = k.__r, Ze = k.diffed, Qe = k.__c, et = k.unmount, tt = k.__;
function ze(t, e) {
  k.__h && k.__h(x, t, ve || e), ve = 0;
  var n = x.__H || (x.__H = { __: [], __h: [] });
  return t >= n.__.length && n.__.push({}), n.__[t];
}
function R(t) {
  return ve = 1, Yt($t, t);
}
function Yt(t, e, n) {
  var i = ze(oe++, 2);
  if (i.t = t, !i.__c && (i.__ = [$t(void 0, e), function(l) {
    var u = i.__N ? i.__N[0] : i.__[0], c = i.t(u, l);
    u !== c && (i.__N = [c, i.__[1]], i.__c.setState({}));
  }], i.__c = x, !x.__f)) {
    var r = function(l, u, c) {
      if (!i.__c.__H) return !0;
      var _ = i.__c.__H.__.filter(function(p) {
        return p.__c;
      });
      if (_.every(function(p) {
        return !p.__N;
      })) return !o || o.call(this, l, u, c);
      var s = i.__c.props !== l;
      return _.some(function(p) {
        if (p.__N) {
          var d = p.__[0];
          p.__ = p.__N, p.__N = void 0, d !== p.__[0] && (s = !0);
        }
      }), o && o.call(this, l, u, c) || s;
    };
    x.__f = !0;
    var o = x.shouldComponentUpdate, a = x.componentWillUpdate;
    x.componentWillUpdate = function(l, u, c) {
      if (this.__e) {
        var _ = o;
        o = void 0, r(l, u, c), o = _;
      }
      a && a.call(this, l, u, c);
    }, x.shouldComponentUpdate = r;
  }
  return i.__N || i.__;
}
function Q(t, e) {
  var n = ze(oe++, 3);
  !k.__s && St(n.__H, e) && (n.__ = t, n.u = e, x.__H.__h.push(n));
}
function V(t) {
  return ve = 5, Fe(function() {
    return { current: t };
  }, []);
}
function Fe(t, e) {
  var n = ze(oe++, 7);
  return St(n.__H, e) && (n.__ = t(), n.__H = e, n.__h = t), n.__;
}
function Xt() {
  for (var t; t = kt.shift(); ) {
    var e = t.__H;
    if (t.__P && e) try {
      e.__h.some(de), e.__h.some(Ne), e.__h = [];
    } catch (n) {
      e.__h = [], k.__e(n, t.__v);
    }
  }
}
k.__b = function(t) {
  x = null, Ye && Ye(t);
}, k.__ = function(t, e) {
  t && e.__k && e.__k.__m && (t.__m = e.__k.__m), tt && tt(t, e);
}, k.__r = function(t) {
  Xe && Xe(t), oe = 0;
  var e = (x = t.__c).__H;
  e && (Te === x ? (e.__h = [], x.__h = [], e.__.some(function(n) {
    n.__N && (n.__ = n.__N), n.u = n.__N = void 0;
  })) : (e.__h.some(de), e.__h.some(Ne), e.__h = [], oe = 0)), Te = x;
}, k.diffed = function(t) {
  Ze && Ze(t);
  var e = t.__c;
  e && e.__H && (e.__H.__h.length && (kt.push(e) !== 1 && Je === k.requestAnimationFrame || ((Je = k.requestAnimationFrame) || Zt)(Xt)), e.__H.__.some(function(n) {
    n.u && (n.__H = n.u), n.u = void 0;
  })), Te = x = null;
}, k.__c = function(t, e) {
  e.some(function(n) {
    try {
      n.__h.some(de), n.__h = n.__h.filter(function(i) {
        return !i.__ || Ne(i);
      });
    } catch (i) {
      e.some(function(r) {
        r.__h && (r.__h = []);
      }), e = [], k.__e(i, n.__v);
    }
  }), Qe && Qe(t, e);
}, k.unmount = function(t) {
  et && et(t);
  var e, n = t.__c;
  n && n.__H && (n.__H.__.some(function(i) {
    try {
      de(i);
    } catch (r) {
      e = r;
    }
  }), n.__H = void 0, e && k.__e(e, n.__v));
};
var nt = typeof requestAnimationFrame == "function";
function Zt(t) {
  var e, n = function() {
    clearTimeout(i), nt && cancelAnimationFrame(e), setTimeout(t);
  }, i = setTimeout(n, 35);
  nt && (e = requestAnimationFrame(n));
}
function de(t) {
  var e = x, n = t.__c;
  typeof n == "function" && (t.__c = void 0, n()), x = e;
}
function Ne(t) {
  var e = x;
  t.__c = t.__(), x = e;
}
function St(t, e) {
  return !t || t.length !== e.length || e.some(function(n, i) {
    return n !== t[i];
  });
}
function $t(t, e) {
  return typeof e == "function" ? e(t) : e;
}
var Qt = Symbol.for("preact-signals");
function ke() {
  if (D > 1)
    D--;
  else {
    for (var t, e = !1; te !== void 0; ) {
      var n = te;
      for (te = void 0, Pe++; n !== void 0; ) {
        var i = n.o;
        if (n.o = void 0, n.f &= -3, !(8 & n.f) && Ct(n)) try {
          n.c();
        } catch (r) {
          e || (t = r, e = !0);
        }
        n = i;
      }
    }
    if (Pe = 0, D--, e) throw t;
  }
}
function en(t) {
  if (D > 0) return t();
  D++;
  try {
    return t();
  } finally {
    ke();
  }
}
var g = void 0;
function Tt(t) {
  var e = g;
  g = void 0;
  try {
    return t();
  } finally {
    g = e;
  }
}
var te = void 0, D = 0, Pe = 0, me = 0;
function It(t) {
  if (g !== void 0) {
    var e = t.n;
    if (e === void 0 || e.t !== g)
      return e = { i: 0, S: t, p: g.s, n: void 0, t: g, e: void 0, x: void 0, r: e }, g.s !== void 0 && (g.s.n = e), g.s = e, t.n = e, 32 & g.f && t.S(e), e;
    if (e.i === -1)
      return e.i = 0, e.n !== void 0 && (e.n.p = e.p, e.p !== void 0 && (e.p.n = e.n), e.p = g.s, e.n = void 0, g.s.n = e, g.s = e), e;
  }
}
function T(t, e) {
  this.v = t, this.i = 0, this.n = void 0, this.t = void 0, this.W = e?.watched, this.Z = e?.unwatched, this.name = e?.name;
}
T.prototype.brand = Qt;
T.prototype.h = function() {
  return !0;
};
T.prototype.S = function(t) {
  var e = this, n = this.t;
  n !== t && t.e === void 0 && (t.x = n, this.t = t, n !== void 0 ? n.e = t : Tt(function() {
    var i;
    (i = e.W) == null || i.call(e);
  }));
};
T.prototype.U = function(t) {
  var e = this;
  if (this.t !== void 0) {
    var n = t.e, i = t.x;
    n !== void 0 && (n.x = i, t.e = void 0), i !== void 0 && (i.e = n, t.x = void 0), t === this.t && (this.t = i, i === void 0 && Tt(function() {
      var r;
      (r = e.Z) == null || r.call(e);
    }));
  }
};
T.prototype.subscribe = function(t) {
  var e = this;
  return re(function() {
    var n = e.value, i = g;
    g = void 0;
    try {
      t(n);
    } finally {
      g = i;
    }
  }, { name: "sub" });
};
T.prototype.valueOf = function() {
  return this.value;
};
T.prototype.toString = function() {
  return this.value + "";
};
T.prototype.toJSON = function() {
  return this.value;
};
T.prototype.peek = function() {
  var t = g;
  g = void 0;
  try {
    return this.value;
  } finally {
    g = t;
  }
};
Object.defineProperty(T.prototype, "value", { get: function() {
  var t = It(this);
  return t !== void 0 && (t.i = this.i), this.v;
}, set: function(t) {
  if (t !== this.v) {
    if (Pe > 100) throw new Error("Cycle detected");
    this.v = t, this.i++, me++, D++;
    try {
      for (var e = this.t; e !== void 0; e = e.x) e.t.N();
    } finally {
      ke();
    }
  }
} });
function C(t, e) {
  return new T(t, e);
}
function Ct(t) {
  for (var e = t.s; e !== void 0; e = e.n) if (e.S.i !== e.i || !e.S.h() || e.S.i !== e.i) return !0;
  return !1;
}
function Et(t) {
  for (var e = t.s; e !== void 0; e = e.n) {
    var n = e.S.n;
    if (n !== void 0 && (e.r = n), e.S.n = e, e.i = -1, e.n === void 0) {
      t.s = e;
      break;
    }
  }
}
function Ot(t) {
  for (var e = t.s, n = void 0; e !== void 0; ) {
    var i = e.p;
    e.i === -1 ? (e.S.U(e), i !== void 0 && (i.n = e.n), e.n !== void 0 && (e.n.p = i)) : n = e, e.S.n = e.r, e.r !== void 0 && (e.r = void 0), e = i;
  }
  t.s = n;
}
function B(t, e) {
  T.call(this, void 0), this.x = t, this.s = void 0, this.g = me - 1, this.f = 4, this.W = e?.watched, this.Z = e?.unwatched, this.name = e?.name;
}
B.prototype = new T();
B.prototype.h = function() {
  if (this.f &= -3, 1 & this.f) return !1;
  if ((36 & this.f) == 32 || (this.f &= -5, this.g === me)) return !0;
  if (this.g = me, this.f |= 1, this.i > 0 && !Ct(this))
    return this.f &= -2, !0;
  var t = g;
  try {
    Et(this), g = this;
    var e = this.x();
    (16 & this.f || this.v !== e || this.i === 0) && (this.v = e, this.f &= -17, this.i++);
  } catch (n) {
    this.v = n, this.f |= 16, this.i++;
  }
  return g = t, Ot(this), this.f &= -2, !0;
};
B.prototype.S = function(t) {
  if (this.t === void 0) {
    this.f |= 36;
    for (var e = this.s; e !== void 0; e = e.n) e.S.S(e);
  }
  T.prototype.S.call(this, t);
};
B.prototype.U = function(t) {
  if (this.t !== void 0 && (T.prototype.U.call(this, t), this.t === void 0)) {
    this.f &= -33;
    for (var e = this.s; e !== void 0; e = e.n) e.S.U(e);
  }
};
B.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 6;
    for (var t = this.t; t !== void 0; t = t.x) t.t.N();
  }
};
Object.defineProperty(B.prototype, "value", { get: function() {
  if (1 & this.f) throw new Error("Cycle detected");
  var t = It(this);
  if (this.h(), t !== void 0 && (t.i = this.i), 16 & this.f) throw this.v;
  return this.v;
} });
function ge(t, e) {
  return new B(t, e);
}
function At(t) {
  var e = t.u;
  if (t.u = void 0, typeof e == "function") {
    D++;
    var n = g;
    g = void 0;
    try {
      e();
    } catch (i) {
      throw t.f &= -2, t.f |= 8, We(t), i;
    } finally {
      g = n, ke();
    }
  }
}
function We(t) {
  for (var e = t.s; e !== void 0; e = e.n) e.S.U(e);
  t.x = void 0, t.s = void 0, At(t);
}
function tn(t) {
  if (g !== this) throw new Error("Out-of-order effect");
  Ot(this), g = t, this.f &= -2, 8 & this.f && We(this), ke();
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
  this.f |= 1, this.f &= -9, At(this), Et(this), D++;
  var t = g;
  return g = this, tn.bind(this, t);
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
var Nt, ce, nn = typeof window < "u" && !!window.__PREACT_SIGNALS_DEVTOOLS__, Pt = [];
re(function() {
  Nt = this.N;
})();
function J(t, e) {
  y[t] = e.bind(null, y[t] || function() {
  });
}
function ye(t) {
  if (ce) {
    var e = ce;
    ce = void 0, e();
  }
  ce = t && t.S();
}
function Mt(t) {
  var e = this, n = t.data, i = Rt(n);
  i.value = n;
  var r = Fe(function() {
    for (var l = e, u = e.__v; u = u.__; ) if (u.__c) {
      u.__c.__$f |= 4;
      break;
    }
    var c = ge(function() {
      var d = i.value.value;
      return d === 0 ? 0 : d === !0 ? "" : d || "";
    }), _ = ge(function() {
      return !Array.isArray(c.value) && !ft(c.value);
    }), s = re(function() {
      if (this.N = Ht, _.value) {
        var d = c.value;
        l.__v && l.__v.__e && l.__v.__e.nodeType === 3 && (l.__v.__e.data = d);
      }
    }), p = e.__$u.d;
    return e.__$u.d = function() {
      s(), p.call(this);
    }, [_, c];
  }, []), o = r[0], a = r[1];
  return o.value ? a.peek() : a.value;
}
Mt.displayName = "ReactiveTextNode";
Object.defineProperties(T.prototype, { constructor: { configurable: !0, value: void 0 }, type: { configurable: !0, value: Mt }, props: { configurable: !0, get: function() {
  return { data: this };
} }, __b: { configurable: !0, value: 1 } });
J("__b", function(t, e) {
  if (typeof e.type == "string") {
    var n, i = e.props;
    for (var r in i) if (r !== "children") {
      var o = i[r];
      o instanceof T && (n || (e.__np = n = {}), n[r] = o, i[r] = o.peek());
    }
  }
  t(e);
});
J("__r", function(t, e) {
  if (t(e), e.type !== U) {
    ye();
    var n, i = e.__c;
    i && (i.__$f &= -2, (n = i.__$u) === void 0 && (i.__$u = n = (function(r, o) {
      var a;
      return re(function() {
        a = this;
      }, { name: o }), a.c = r, a;
    })(function() {
      var r;
      nn && ((r = n.y) == null || r.call(n)), i.__$f |= 1, i.setState({});
    }, typeof e.type == "function" ? e.type.displayName || e.type.name : ""))), ye(n);
  }
});
J("__e", function(t, e, n, i) {
  ye(), t(e, n, i);
});
J("diffed", function(t, e) {
  ye();
  var n;
  if (typeof e.type == "string" && (n = e.__e)) {
    var i = e.__np, r = e.props;
    if (i) {
      var o = n.U;
      if (o) for (var a in o) {
        var l = o[a];
        l !== void 0 && !(a in i) && (l.d(), o[a] = void 0);
      }
      else
        o = {}, n.U = o;
      for (var u in i) {
        var c = o[u], _ = i[u];
        c === void 0 ? (c = on(n, u, _), o[u] = c) : c.o(_, r);
      }
      for (var s in i) r[s] = i[s];
    }
  }
  t(e);
});
function on(t, e, n, i) {
  var r = e in t && t.ownerSVGElement === void 0, o = C(n), a = n.peek();
  return { o: function(l, u) {
    o.value = l, a = l.peek();
  }, d: re(function() {
    this.N = Ht;
    var l = o.value.value;
    a !== l ? (a = void 0, r ? t[e] = l : l != null && (l !== !1 || e[4] === "-") ? t.setAttribute(e, l) : t.removeAttribute(e)) : a = void 0;
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
    var a = e.__c;
    if (a) {
      var l = a.__$u;
      l && (a.__$u = void 0, l.d());
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
  for (var a in t) if (a !== "__source" && t[a] !== this.props[a]) return !0;
  for (var l in this.props) if (!(l in t)) return !0;
  return !1;
};
function Rt(t, e) {
  return Fe(function() {
    return C(t, e);
  }, []);
}
var rn = function(t) {
  queueMicrotask(function() {
    queueMicrotask(t);
  });
};
function sn() {
  en(function() {
    for (var t; t = Pt.shift(); ) Nt.call(t);
  });
}
function Ht() {
  Pt.push(this) === 1 && (y.requestAnimationFrame || rn)(sn);
}
const E = C(!1), it = C(!1), I = C([]), S = C(null), L = C(null), M = C(null), z = C(null), Z = C(""), ne = C(!1), be = C(!1), $ = C({
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
}), Dt = C(!1), an = ge(
  () => $.value.requireEmail && !z.value && !S.value
), ln = ge(() => !!S.value), Ut = "guddesk_state";
function Be() {
  try {
    localStorage.setItem(
      Ut,
      JSON.stringify({
        conversationId: S.value,
        visitorId: L.value,
        visitorToken: M.value,
        visitorEmail: z.value
      })
    );
  } catch {
  }
}
function cn() {
  try {
    const t = localStorage.getItem(Ut);
    if (!t) return;
    const e = JSON.parse(t);
    e.conversationId && (S.value = e.conversationId), e.visitorId && (L.value = e.visitorId), e.visitorToken && (M.value = e.visitorToken), e.visitorEmail && (z.value = e.visitorEmail);
  } catch {
  }
}
function un(t, e, n) {
  return {
    appId: t,
    visitorToken: e,
    externalId: n.userId,
    name: n.name,
    email: n.email,
    metadata: n.metadata,
    userHash: n.userHash
  };
}
function fn(t) {
  const e = { ...t.extra };
  return t.hasBody && (e["Content-Type"] = "application/json"), t.visitorToken && (e["x-visitor-token"] = t.visitorToken), e;
}
let se = "", Lt = "";
function dn(t, e) {
  se = t, Lt = e.replace(/\/$/, "");
}
async function Y(t, e = {}) {
  const n = fn({
    hasBody: !!e.body,
    visitorToken: M.value,
    extra: e.headers
  }), i = await fetch(`${Lt}${t}`, { ...e, headers: n });
  if (!i.ok) {
    const r = await i.json().catch(() => ({ error: "Request failed" }));
    throw new Error(r.error || "Request failed");
  }
  return i.json();
}
async function _n() {
  const t = await Y(
    `/api/widget/config?appId=${encodeURIComponent(se)}`
  );
  $.value = t, Dt.value = !0;
}
async function pn() {
  if (M.value && L.value) return;
  const t = await Y(
    "/api/widget/auth",
    { method: "POST", body: JSON.stringify({ appId: se }) }
  );
  L.value = t.visitorId, M.value = t.visitorToken, Be();
}
async function Se(t) {
  const e = await Y(
    "/api/widget/visitors",
    {
      method: "POST",
      body: JSON.stringify(
        un(se, M.value, t)
      )
    }
  );
  L.value = e.visitorId, M.value = e.visitorToken, t.email && (z.value = t.email), Be();
}
let hn = 0;
function zt(t) {
  const e = `_opt_${++hn}`, n = {
    id: e,
    body: t,
    type: "VISITOR",
    senderName: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    _sending: !0
  };
  return I.value = [...I.value, n], e;
}
function Me(t, e) {
  e ? I.value = I.value.map((n) => n.id === t ? e : n) : I.value = I.value.map(
    (n) => n.id === t ? { ...n, _sending: !1 } : n
  );
}
async function vn(t) {
  const e = zt(t);
  try {
    const n = await Y("/api/widget/conversations", {
      method: "POST",
      body: JSON.stringify({
        appId: se,
        visitorToken: M.value,
        message: t,
        visitorName: null,
        visitorEmail: z.value
      })
    });
    S.value = n.conversationId, L.value = n.visitorId, M.value = n.visitorToken, I.value = n.messages, Be();
  } catch {
    Me(e, null);
  }
}
async function mn(t) {
  if (!S.value)
    return vn(t);
  const e = zt(t);
  try {
    const n = await Y(
      `/api/widget/conversations/${S.value}/messages`,
      { method: "POST", body: JSON.stringify({ message: t }) }
    );
    Me(e, n);
  } catch {
    Me(e, null);
  }
}
async function Ie() {
  if (!S.value) return;
  const t = await Y(
    `/api/widget/conversations/${S.value}/messages`
  );
  I.value = t.messages;
}
const gn = "https://www.guddesk.com", yn = /* @__PURE__ */ new Set([
  "cdn.guddesk.com",
  "www.guddesk.com",
  "guddesk.com"
]);
function bn(t, e, n) {
  if (n)
    return n.replace(/\/$/, "");
  if (t)
    try {
      const i = new URL(t);
      if (yn.has(i.hostname))
        return gn;
      if (i.hostname.includes("guddesk") || t.includes("widget"))
        return i.origin;
    } catch {
    }
  return e;
}
function wn(t) {
  for (let e = t.length - 1; e >= 0; e--) {
    const n = t[e]?.src;
    if (n && (n.includes("guddesk") || n.includes("widget")))
      return n;
  }
}
const ot = "#3ECF8E", xn = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, ue = String.raw`(?:\d+(?:\.\d+)?|\.\d+)%?`, kn = new RegExp(
  String.raw`^rgba?\(\s*${ue}\s*,\s*${ue}\s*,\s*${ue}\s*(?:,\s*${ue}\s*)?\)$`,
  "i"
);
function rt(t) {
  if (typeof t != "string") return !1;
  const e = t.trim();
  return xn.test(e) || kn.test(e);
}
function Re(t, e = ot) {
  return rt(t) ? t.trim() : rt(e) ? e.trim() : ot;
}
const Sn = 440;
function st(t) {
  if (t == null || t === "") return;
  const e = t.trim().toLowerCase();
  if (e === "true" || e === "1") return !0;
  if (e === "false" || e === "0") return !1;
}
function $n(t) {
  const e = {}, n = t.getAttribute("data-app-id") || t.getAttribute("data-guddesk") || void 0;
  n && (e.appId = n);
  const i = t.getAttribute("data-base-url");
  i && (e.baseUrl = i);
  const r = st(t.getAttribute("data-open-on-load"));
  r !== void 0 && (e.openOnLoad = r);
  const o = st(t.getAttribute("data-hide-on-mobile"));
  o !== void 0 && (e.hideOnMobile = o);
  const a = t.getAttribute("data-name");
  a && (e.name = a);
  const l = t.getAttribute("data-email");
  l && (e.email = l);
  const u = t.getAttribute("data-accent-color");
  u && (e.accentColor = u);
  const c = t.getAttribute("data-position");
  return c && (e.position = c), t.hasAttribute?.("data-greeting") && (e.greeting = t.getAttribute("data-greeting") ?? ""), e;
}
function Tn(t, e) {
  return { ...t, ...e };
}
function In(t, e) {
  return {
    primaryColor: Re(
      e.accentColor,
      Re(t.primaryColor)
    ),
    position: e.position ?? t.position,
    welcomeMessage: e.greeting !== void 0 ? e.greeting : t.welcomeMessage
  };
}
function Cn(t, e, n = Sn) {
  return !!t && e <= n;
}
function En(t) {
  for (let e = t.length - 1; e >= 0; e--) {
    const n = t[e];
    if (n && (n.getAttribute("data-app-id") || n.getAttribute("data-guddesk") || n.src && (n.src.includes("widget.js") || n.src.includes("guddesk"))))
      return n;
  }
}
var On = 0;
function f(t, e, n, i, r, o) {
  e || (e = {});
  var a, l, u = e;
  if ("ref" in u) for (l in u = {}, e) l == "ref" ? a = e[l] : u[l] = e[l];
  var c = { type: t, props: u, key: n, ref: a, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --On, __i: -1, __u: 0, __source: r, __self: o };
  if (typeof t == "function" && (a = t.defaultProps)) for (l in a) u[l] === void 0 && (u[l] = a[l]);
  return y.vnode && y.vnode(c), c;
}
function An(t) {
  const e = t.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/\*\*/g, "{{GLOBSTAR}}").replace(/\*/g, "[^/]*").replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${e}$`);
}
function Nn(t, e, n) {
  if (!n || n.length === 0) return !0;
  const i = n.some((r) => {
    try {
      return An(r).test(t);
    } catch {
      return !1;
    }
  });
  return e === "exclude" ? !i : i;
}
let P = null, A = null, q = null;
const Pn = 8e3;
async function Mn(t, e, n) {
  const { default: i } = await import("pusher-js"), r = new i(t, {
    cluster: e,
    channelAuthorization: {
      endpoint: n,
      transport: "ajax",
      customHandler: ({ channelName: o, socketId: a }, l) => {
        fetch(n, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-visitor-token": M.value ?? ""
          },
          body: new URLSearchParams({
            socket_id: a,
            channel_name: o
          }).toString()
        }).then(async (u) => {
          if (!u.ok) {
            l(
              new Error(`Pusher auth failed: ${u.status}`),
              null
            );
            return;
          }
          const c = await u.json();
          l(null, c);
        }).catch((u) => l(u, null));
      }
    }
  });
  return await new Promise((o, a) => {
    const l = setTimeout(() => {
      u();
      try {
        r.disconnect();
      } catch {
      }
      a(new Error("Pusher connection timeout"));
    }, Pn);
    function u() {
      clearTimeout(l), r.connection.unbind("connected", c), r.connection.unbind("error", _), r.connection.unbind("unavailable", _), r.connection.unbind("failed", _);
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
      a(s instanceof Error ? s : new Error("Pusher connection error"));
    }
    r.connection.bind("connected", c), r.connection.bind("error", _), r.connection.bind("unavailable", _), r.connection.bind("failed", _);
  }), P = r, P;
}
function at() {
  if (!P || !S.value) return;
  A && (A.unbind_all(), P.unsubscribe(A.name));
  const t = `private-visitor-${S.value}`;
  A = P.subscribe(t), A.bind("message:created", (e) => {
    I.value.some((n) => n.id === e.id) || (I.value = [...I.value, e]);
  }), A.bind("typing:start", () => {
    ne.value = !0, q && clearTimeout(q), q = setTimeout(() => {
      ne.value = !1;
    }, 4e3);
  }), A.bind("typing:stop", () => {
    ne.value = !1, q && (clearTimeout(q), q = null);
  });
}
function Ce() {
  return P?.connection?.state === "connected";
}
function Rn() {
  A && (A.unbind_all(), P?.unsubscribe(A.name), A = null), P && (P.disconnect(), P = null);
}
const Hn = "guddesk_identified:";
function Ft(t) {
  return `${Hn}${t}`;
}
function Wt(t) {
  return JSON.stringify([
    t.visitorId ?? "",
    t.userId ?? "",
    t.name ?? "",
    t.email ?? ""
  ]);
}
function Dn(t, e, n) {
  if (!t) return !0;
  try {
    return t.getItem(Ft(e)) !== Wt(n);
  } catch {
    return !0;
  }
}
function Un(t, e, n) {
  if (t)
    try {
      t.setItem(Ft(e), Wt(n));
    } catch {
    }
}
function Ln() {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
}
function zn(t, e) {
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
const Fn = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', Wn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', Bn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function Gn() {
  return /* @__PURE__ */ f("div", { class: "fc-header", style: { position: "relative" }, children: [
    /* @__PURE__ */ f("div", { class: "fc-header-title", children: $.value.workspaceName || "Support" }),
    /* @__PURE__ */ f("div", { class: "fc-header-subtitle", children: "We typically reply in a few minutes" }),
    /* @__PURE__ */ f(
      "button",
      {
        class: "fc-header-close",
        onClick: () => E.value = !1,
        "aria-label": "Close chat",
        dangerouslySetInnerHTML: { __html: Wn }
      }
    )
  ] });
}
function qn(t) {
  try {
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function lt() {
  const t = V(null);
  return Q(() => {
    t.current?.scrollIntoView({ behavior: "smooth" });
  }, [I.value.length, ne.value]), ln.value ? /* @__PURE__ */ f("div", { class: "fc-messages", children: [
    I.value.map((e) => /* @__PURE__ */ f(
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
                ] }) : qn(e.createdAt) })
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
  ] }) : /* @__PURE__ */ f("div", { class: "fc-messages", children: /* @__PURE__ */ f("div", { class: "fc-msg fc-msg-agent", children: $.value.welcomeMessage }) });
}
function Vn() {
  const t = V(null);
  async function e() {
    const i = Z.value.trim();
    !i || it.value || (Z.value = "", await mn(i), t.current?.focus());
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
        value: Z.value,
        onInput: (i) => {
          Z.value = i.target.value;
        },
        onKeyDown: n
      }
    ),
    /* @__PURE__ */ f(
      "button",
      {
        class: "fc-send-btn",
        onClick: e,
        disabled: !Z.value.trim() || it.value,
        children: "Send"
      }
    )
  ] });
}
function jn() {
  const [t, e] = R(""), [n, i] = R(""), [r, o] = R(!1);
  async function a(l) {
    l.preventDefault();
    const u = t.trim();
    if (!u || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) {
      i("Please enter a valid email address.");
      return;
    }
    o(!0), i("");
    try {
      await Se({ email: u }), z.value = u;
    } catch {
      i("Something went wrong. Please try again.");
    } finally {
      o(!1);
    }
  }
  return /* @__PURE__ */ f("form", { class: "fc-prechat", onSubmit: a, children: [
    /* @__PURE__ */ f("label", { children: "Enter your email to start chatting" }),
    /* @__PURE__ */ f(
      "input",
      {
        type: "email",
        placeholder: "you@example.com",
        value: t,
        onInput: (l) => e(l.target.value),
        required: !0
      }
    ),
    n && /* @__PURE__ */ f("div", { style: { color: "#ef4444", fontSize: "12px" }, children: n }),
    /* @__PURE__ */ f("button", { type: "submit", disabled: r, children: r ? "..." : "Start Chat" })
  ] });
}
function Kn() {
  const [t, e] = R(""), [n, i] = R(z.value ?? ""), [r, o] = R(""), [a, l] = R(!1), [u, c] = R(!1), [_, s] = R("");
  async function p(v) {
    v.preventDefault();
    const b = n.trim();
    if (!b || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b)) {
      s("Please enter a valid email address.");
      return;
    }
    c(!0), s("");
    try {
      await Se({
        email: b,
        name: t.trim() || void 0
      }), z.value = b, l(!0);
    } catch {
      s("Something went wrong. Please try again.");
    } finally {
      c(!1);
    }
  }
  function d() {
    be.value = !1;
  }
  return a ? /* @__PURE__ */ f("div", { class: "fc-offline-form", children: /* @__PURE__ */ f("div", { class: "fc-offline-success", children: [
    /* @__PURE__ */ f("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: $.value.primaryColor, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
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
            onInput: (v) => e(v.target.value)
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
            onInput: (v) => i(v.target.value),
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
            onInput: (v) => o(v.target.value)
          }
        )
      ] }),
      _ && /* @__PURE__ */ f("div", { class: "fc-offline-error", children: _ }),
      /* @__PURE__ */ f("button", { type: "submit", class: "fc-offline-submit", disabled: u, children: u ? "Sending..." : "Leave a message" }),
      /* @__PURE__ */ f("button", { type: "button", class: "fc-offline-dismiss", onClick: d, children: "Continue chatting" })
    ] })
  ] });
}
function Jn() {
  return /* @__PURE__ */ f("div", { class: "fc-window", children: [
    /* @__PURE__ */ f(Gn, {}),
    an.value ? /* @__PURE__ */ f(jn, {}) : be.value ? /* @__PURE__ */ f(U, { children: [
      /* @__PURE__ */ f(lt, {}),
      /* @__PURE__ */ f(Kn, {})
    ] }) : /* @__PURE__ */ f(U, { children: [
      /* @__PURE__ */ f(lt, {}),
      /* @__PURE__ */ f(Vn, {})
    ] }),
    $.value.showBranding && /* @__PURE__ */ f("div", { class: "fc-branding", children: [
      "Powered by",
      " ",
      /* @__PURE__ */ f("a", { href: "https://guddesk.com", target: "_blank", rel: "noopener", children: "GudDesk" })
    ] })
  ] });
}
function Yn() {
  return /* @__PURE__ */ f(
    "button",
    {
      class: "fc-bubble",
      onClick: () => E.value = !E.value,
      "aria-label": E.value ? "Close chat" : "Open chat",
      dangerouslySetInnerHTML: {
        __html: E.value ? Bn : Fn
      }
    }
  );
}
const Xn = 4e3;
function Zn({
  appId: t,
  baseUrl: e,
  pusherKey: n,
  pusherCluster: i,
  snippet: r = {}
}) {
  const o = V(null), a = V(!1), l = V(null), u = V(0), c = Rt(!1);
  function _() {
    s(), o.current = setInterval(() => {
      S.value && E.value && Ie().catch(() => {
      });
    }, Xn);
  }
  function s() {
    o.current && (clearInterval(o.current), o.current = null);
  }
  async function p(d, v) {
    if (!a.current) {
      a.current = !0;
      try {
        await Mn(d, v, `${e}/api/pusher/auth`), S.value && at(), s();
      } catch {
        a.current = !1, _();
      }
    }
  }
  return Q(() => (cn(), dn(t, e), Promise.all([
    _n().catch(() => {
    }),
    pn().catch(() => {
    })
  ]).then(() => {
    const d = In($.value, r);
    if ($.value = { ...$.value, ...d }, !Nn(
      window.location.pathname,
      $.value.pageVisibilityMode,
      $.value.pageVisibilityPatterns
    ) || Cn(r.hideOnMobile, window.innerWidth)) {
      c.value = !0;
      return;
    }
    if (r.openOnLoad && (E.value = !0), r.name || r.email) {
      const h = Ln(), m = { name: r.name, email: r.email };
      Dn(h, t, {
        ...m,
        visitorId: L.value
      }) && Se(m).then(() => {
        Un(h, t, {
          ...m,
          visitorId: L.value
        });
      }).catch(() => {
      });
    }
    S.value && Ie().catch(() => {
    });
    const b = n || $.value.pusherKey, w = i || $.value.pusherCluster;
    b && w ? p(b, w) : _();
  }), () => {
    Rn(), s();
  }), []), Q(() => {
    S.value && (Ce() ? at() : o.current || _());
  }, [S.value]), Q(() => {
    E.value && S.value && !Ce() ? (Ie().catch(() => {
    }), _()) : !E.value && !Ce() && s();
  }, [E.value]), Q(() => {
    const d = $.value.offlineFormTimeout;
    if (!d || !S.value) return;
    const v = I.value, b = v.filter((h) => h.type === "VISITOR").length;
    if (v.some((h) => h.type === "AGENT" || h.type === "BOT")) {
      be.value = !1, l.current && (clearTimeout(l.current), l.current = null), u.current = b;
      return;
    }
    return b > u.current && (u.current = b, l.current && clearTimeout(l.current), l.current = setTimeout(() => {
      I.value.some((O) => O.type === "AGENT" || O.type === "BOT") || (be.value = !0);
    }, d * 60 * 1e3)), () => {
      l.current && (clearTimeout(l.current), l.current = null);
    };
  }, [I.value, S.value, $.value.offlineFormTimeout]), !Dt.value || c.value ? null : /* @__PURE__ */ f(U, { children: [
    /* @__PURE__ */ f("style", { children: zn(Re($.value.primaryColor), $.value.position) }),
    /* @__PURE__ */ f("div", { class: "fc-container", children: [
      E.value && /* @__PURE__ */ f(Jn, {}),
      /* @__PURE__ */ f(Yn, {})
    ] })
  ] });
}
let ie = null;
function Qn(t) {
  const e = Array.from(document.querySelectorAll("script[src]")).map(
    (n) => ({ src: n.src })
  );
  return bn(
    wn(e),
    window.location.origin,
    t
  );
}
function ei() {
  const t = Array.from(document.querySelectorAll("script")), e = En(
    t.map((r) => r)
  ), n = e ? $n(e) : {}, i = Tn(n, window.GudDeskSettings);
  return i.appId ? i : null;
}
function Bt(t) {
  if (ie) return;
  const e = t.appId;
  if (!e) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }
  const n = Qn(t.baseUrl), i = document.createElement("div");
  i.id = "guddesk-widget", document.body.appendChild(i), ie = i.attachShadow({ mode: "open" }), xt(
    ht(Zn, {
      appId: e,
      baseUrl: n,
      pusherKey: t.pusherKey,
      pusherCluster: t.pusherCluster,
      snippet: t
    }),
    ie
  );
}
function ti() {
  const t = document.getElementById("guddesk-widget");
  t && (xt(null, ie), t.remove(), ie = null);
}
function ct() {
  const t = ei();
  t && Bt(t);
}
const ni = {
  init: Bt,
  identify: (t) => Se(t),
  open: () => {
    E.value = !0;
  },
  close: () => {
    E.value = !1;
  },
  destroy: ti
};
window.GudDesk = ni;
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ct) : ct();
export {
  ni as default
};
