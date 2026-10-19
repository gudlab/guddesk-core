var be, m, rt, st, F, qe, at, lt, ct, He, Ie, Ce, de = {}, _e = [], Mt = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, we = Array.isArray;
function R(t, e) {
  for (var n in e) t[n] = e[n];
  return t;
}
function Re(t) {
  t && t.parentNode && t.parentNode.removeChild(t);
}
function ut(t, e, n) {
  var i, r, o, a = {};
  for (o in e) o == "key" ? i = e[o] : o == "ref" ? r = e[o] : a[o] = e[o];
  if (arguments.length > 2 && (a.children = arguments.length > 3 ? be.call(arguments, 2) : n), typeof t == "function" && t.defaultProps != null) for (o in t.defaultProps) a[o] === void 0 && (a[o] = t.defaultProps[o]);
  return ue(t, a, i, r, null);
}
function ue(t, e, n, i, r) {
  var o = { type: t, props: e, key: n, ref: i, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: r ?? ++rt, __i: -1, __u: 0 };
  return r == null && m.vnode != null && m.vnode(o), o;
}
function U(t) {
  return t.children;
}
function ee(t, e) {
  this.props = t, this.context = e;
}
function V(t, e) {
  if (e == null) return t.__ ? V(t.__, t.__i + 1) : null;
  for (var n; e < t.__k.length; e++) if ((n = t.__k[e]) != null && n.__e != null) return n.__e;
  return typeof t.type == "function" ? V(t) : null;
}
function Dt(t) {
  if (t.__P && t.__d) {
    var e = t.__v, n = e.__e, i = [], r = [], o = R({}, e);
    o.__v = e.__v + 1, m.vnode && m.vnode(o), Me(t.__P, o, e, t.__n, t.__P.namespaceURI, 32 & e.__u ? [n] : null, i, n ?? V(e), !!(32 & e.__u), r), o.__v = e.__v, o.__.__k[o.__i] = o, pt(i, o, r), e.__e = e.__ = null, o.__e != n && ft(o);
  }
}
function ft(t) {
  if ((t = t.__) != null && t.__c != null) return t.__e = t.__c.base = null, t.__k.some(function(e) {
    if (e != null && e.__e != null) return t.__e = t.__c.base = e.__e;
  }), ft(t);
}
function Ge(t) {
  (!t.__d && (t.__d = !0) && F.push(t) && !pe.__r++ || qe != m.debounceRendering) && ((qe = m.debounceRendering) || at)(pe);
}
function pe() {
  for (var t, e = 1; F.length; ) F.length > e && F.sort(lt), t = F.shift(), e = F.length, Dt(t);
  pe.__r = 0;
}
function dt(t, e, n, i, r, o, a, l, u, c, _) {
  var s, p, d, h, S, b, y, g = i && i.__k || _e, M = e.length;
  for (u = Ut(n, e, g, u, M), s = 0; s < M; s++) (d = n.__k[s]) != null && (p = d.__i != -1 && g[d.__i] || de, d.__i = s, b = Me(t, d, p, r, o, a, l, u, c, _), h = d.__e, d.ref && p.ref != d.ref && (p.ref && De(p.ref, null, d), _.push(d.ref, d.__c || h, d)), S == null && h != null && (S = h), (y = !!(4 & d.__u)) || p.__k === d.__k ? u = _t(d, u, t, y) : typeof d.type == "function" && b !== void 0 ? u = b : h && (u = h.nextSibling), d.__u &= -7);
  return n.__e = S, u;
}
function Ut(t, e, n, i, r) {
  var o, a, l, u, c, _ = n.length, s = _, p = 0;
  for (t.__k = new Array(r), o = 0; o < r; o++) (a = e[o]) != null && typeof a != "boolean" && typeof a != "function" ? (typeof a == "string" || typeof a == "number" || typeof a == "bigint" || a.constructor == String ? a = t.__k[o] = ue(null, a, null, null, null) : we(a) ? a = t.__k[o] = ue(U, { children: a }, null, null, null) : a.constructor === void 0 && a.__b > 0 ? a = t.__k[o] = ue(a.type, a.props, a.key, a.ref ? a.ref : null, a.__v) : t.__k[o] = a, u = o + p, a.__ = t, a.__b = t.__b + 1, l = null, (c = a.__i = zt(a, n, u, s)) != -1 && (s--, (l = n[c]) && (l.__u |= 2)), l == null || l.__v == null ? (c == -1 && (r > _ ? p-- : r < _ && p++), typeof a.type != "function" && (a.__u |= 4)) : c != u && (c == u - 1 ? p-- : c == u + 1 ? p++ : (c > u ? p-- : p++, a.__u |= 4))) : t.__k[o] = null;
  if (s) for (o = 0; o < _; o++) (l = n[o]) != null && (2 & l.__u) == 0 && (l.__e == i && (i = V(l)), vt(l, l));
  return i;
}
function _t(t, e, n, i) {
  var r, o;
  if (typeof t.type == "function") {
    for (r = t.__k, o = 0; r && o < r.length; o++) r[o] && (r[o].__ = t, e = _t(r[o], e, n, i));
    return e;
  }
  t.__e != e && (i && (e && t.type && !e.parentNode && (e = V(t)), n.insertBefore(t.__e, e || null)), e = t.__e);
  do
    e = e && e.nextSibling;
  while (e != null && e.nodeType == 8);
  return e;
}
function zt(t, e, n, i) {
  var r, o, a, l = t.key, u = t.type, c = e[n], _ = c != null && (2 & c.__u) == 0;
  if (c === null && l == null || _ && l == c.key && u == c.type) return n;
  if (i > (_ ? 1 : 0)) {
    for (r = n - 1, o = n + 1; r >= 0 || o < e.length; ) if ((c = e[a = r >= 0 ? r-- : o++]) != null && (2 & c.__u) == 0 && l == c.key && u == c.type) return a;
  }
  return -1;
}
function Ve(t, e, n) {
  e[0] == "-" ? t.setProperty(e, n ?? "") : t[e] = n == null ? "" : typeof n != "number" || Mt.test(e) ? n : n + "px";
}
function le(t, e, n, i, r) {
  var o, a;
  e: if (e == "style") if (typeof n == "string") t.style.cssText = n;
  else {
    if (typeof i == "string" && (t.style.cssText = i = ""), i) for (e in i) n && e in n || Ve(t.style, e, "");
    if (n) for (e in n) i && n[e] == i[e] || Ve(t.style, e, n[e]);
  }
  else if (e[0] == "o" && e[1] == "n") o = e != (e = e.replace(ct, "$1")), a = e.toLowerCase(), e = a in t || e == "onFocusOut" || e == "onFocusIn" ? a.slice(2) : e.slice(2), t.l || (t.l = {}), t.l[e + o] = n, n ? i ? n.u = i.u : (n.u = He, t.addEventListener(e, o ? Ce : Ie, o)) : t.removeEventListener(e, o ? Ce : Ie, o);
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
function je(t) {
  return function(e) {
    if (this.l) {
      var n = this.l[e.type + t];
      if (e.t == null) e.t = He++;
      else if (e.t < n.u) return;
      return n(m.event ? m.event(e) : e);
    }
  };
}
function Me(t, e, n, i, r, o, a, l, u, c) {
  var _, s, p, d, h, S, b, y, g, M, L, Z, Be, ae, ke, P = e.type;
  if (e.constructor !== void 0) return null;
  128 & n.__u && (u = !!(32 & n.__u), o = [l = e.__e = n.__e]), (_ = m.__b) && _(e);
  e: if (typeof P == "function") try {
    if (y = e.props, g = "prototype" in P && P.prototype.render, M = (_ = P.contextType) && i[_.__c], L = _ ? M ? M.props.value : _.__ : i, n.__c ? b = (s = e.__c = n.__c).__ = s.__E : (g ? e.__c = s = new P(y, L) : (e.__c = s = new ee(y, L), s.constructor = P, s.render = Ft), M && M.sub(s), s.state || (s.state = {}), s.__n = i, p = s.__d = !0, s.__h = [], s._sb = []), g && s.__s == null && (s.__s = s.state), g && P.getDerivedStateFromProps != null && (s.__s == s.state && (s.__s = R({}, s.__s)), R(s.__s, P.getDerivedStateFromProps(y, s.__s))), d = s.props, h = s.state, s.__v = e, p) g && P.getDerivedStateFromProps == null && s.componentWillMount != null && s.componentWillMount(), g && s.componentDidMount != null && s.__h.push(s.componentDidMount);
    else {
      if (g && P.getDerivedStateFromProps == null && y !== d && s.componentWillReceiveProps != null && s.componentWillReceiveProps(y, L), e.__v == n.__v || !s.__e && s.shouldComponentUpdate != null && s.shouldComponentUpdate(y, s.__s, L) === !1) {
        e.__v != n.__v && (s.props = y, s.state = s.__s, s.__d = !1), e.__e = n.__e, e.__k = n.__k, e.__k.some(function(B) {
          B && (B.__ = e);
        }), _e.push.apply(s.__h, s._sb), s._sb = [], s.__h.length && a.push(s);
        break e;
      }
      s.componentWillUpdate != null && s.componentWillUpdate(y, s.__s, L), g && s.componentDidUpdate != null && s.__h.push(function() {
        s.componentDidUpdate(d, h, S);
      });
    }
    if (s.context = L, s.props = y, s.__P = t, s.__e = !1, Z = m.__r, Be = 0, g) s.state = s.__s, s.__d = !1, Z && Z(e), _ = s.render(s.props, s.state, s.context), _e.push.apply(s.__h, s._sb), s._sb = [];
    else do
      s.__d = !1, Z && Z(e), _ = s.render(s.props, s.state, s.context), s.state = s.__s;
    while (s.__d && ++Be < 25);
    s.state = s.__s, s.getChildContext != null && (i = R(R({}, i), s.getChildContext())), g && !p && s.getSnapshotBeforeUpdate != null && (S = s.getSnapshotBeforeUpdate(d, h)), ae = _ != null && _.type === U && _.key == null ? ht(_.props.children) : _, l = dt(t, we(ae) ? ae : [ae], e, n, i, r, o, a, l, u, c), s.base = e.__e, e.__u &= -161, s.__h.length && a.push(s), b && (s.__E = s.__ = null);
  } catch (B) {
    if (e.__v = null, u || o != null) if (B.then) {
      for (e.__u |= u ? 160 : 128; l && l.nodeType == 8 && l.nextSibling; ) l = l.nextSibling;
      o[o.indexOf(l)] = null, e.__e = l;
    } else {
      for (ke = o.length; ke--; ) Re(o[ke]);
      Ee(e);
    }
    else e.__e = n.__e, e.__k = n.__k, B.then || Ee(e);
    m.__e(B, e, n);
  }
  else o == null && e.__v == n.__v ? (e.__k = n.__k, e.__e = n.__e) : l = e.__e = Lt(n.__e, e, n, i, r, o, a, u, c);
  return (_ = m.diffed) && _(e), 128 & e.__u ? void 0 : l;
}
function Ee(t) {
  t && (t.__c && (t.__c.__e = !0), t.__k && t.__k.some(Ee));
}
function pt(t, e, n) {
  for (var i = 0; i < n.length; i++) De(n[i], n[++i], n[++i]);
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
function ht(t) {
  return typeof t != "object" || t == null || t.__b > 0 ? t : we(t) ? t.map(ht) : R({}, t);
}
function Lt(t, e, n, i, r, o, a, l, u) {
  var c, _, s, p, d, h, S, b = n.props || de, y = e.props, g = e.type;
  if (g == "svg" ? r = "http://www.w3.org/2000/svg" : g == "math" ? r = "http://www.w3.org/1998/Math/MathML" : r || (r = "http://www.w3.org/1999/xhtml"), o != null) {
    for (c = 0; c < o.length; c++) if ((d = o[c]) && "setAttribute" in d == !!g && (g ? d.localName == g : d.nodeType == 3)) {
      t = d, o[c] = null;
      break;
    }
  }
  if (t == null) {
    if (g == null) return document.createTextNode(y);
    t = document.createElementNS(r, g, y.is && y), l && (m.__m && m.__m(e, o), l = !1), o = null;
  }
  if (g == null) b === y || l && t.data == y || (t.data = y);
  else {
    if (o = o && be.call(t.childNodes), !l && o != null) for (b = {}, c = 0; c < t.attributes.length; c++) b[(d = t.attributes[c]).name] = d.value;
    for (c in b) d = b[c], c == "dangerouslySetInnerHTML" ? s = d : c == "children" || c in y || c == "value" && "defaultValue" in y || c == "checked" && "defaultChecked" in y || le(t, c, null, d, r);
    for (c in y) d = y[c], c == "children" ? p = d : c == "dangerouslySetInnerHTML" ? _ = d : c == "value" ? h = d : c == "checked" ? S = d : l && typeof d != "function" || b[c] === d || le(t, c, d, b[c], r);
    if (_) l || s && (_.__html == s.__html || _.__html == t.innerHTML) || (t.innerHTML = _.__html), e.__k = [];
    else if (s && (t.innerHTML = ""), dt(e.type == "template" ? t.content : t, we(p) ? p : [p], e, n, i, g == "foreignObject" ? "http://www.w3.org/1999/xhtml" : r, o, a, o ? o[0] : n.__k && V(n, 0), l, u), o != null) for (c = o.length; c--; ) Re(o[c]);
    l || (c = "value", g == "progress" && h == null ? t.removeAttribute("value") : h != null && (h !== t[c] || g == "progress" && !h || g == "option" && h != b[c]) && le(t, c, h, b[c], r), c = "checked", S != null && S != t[c] && le(t, c, S, b[c], r));
  }
  return t;
}
function De(t, e, n) {
  try {
    if (typeof t == "function") {
      var i = typeof t.__u == "function";
      i && t.__u(), i && e == null || (t.__u = t(e));
    } else t.current = e;
  } catch (r) {
    m.__e(r, n);
  }
}
function vt(t, e, n) {
  var i, r;
  if (m.unmount && m.unmount(t), (i = t.ref) && (i.current && i.current != t.__e || De(i, null, e)), (i = t.__c) != null) {
    if (i.componentWillUnmount) try {
      i.componentWillUnmount();
    } catch (o) {
      m.__e(o, e);
    }
    i.base = i.__P = null;
  }
  if (i = t.__k) for (r = 0; r < i.length; r++) i[r] && vt(i[r], e, n || typeof t.type != "function");
  n || Re(t.__e), t.__c = t.__ = t.__e = void 0;
}
function Ft(t, e, n) {
  return this.constructor(t, n);
}
function mt(t, e, n) {
  var i, r, o, a;
  e == document && (e = document.documentElement), m.__ && m.__(t, e), r = (i = !1) ? null : e.__k, o = [], a = [], Me(e, t = e.__k = ut(U, null, [t]), r || de, de, e.namespaceURI, r ? null : e.firstChild ? be.call(e.childNodes) : null, o, r ? r.__e : e.firstChild, i, a), pt(o, t, a);
}
be = _e.slice, m = { __e: function(t, e, n, i) {
  for (var r, o, a; e = e.__; ) if ((r = e.__c) && !r.__) try {
    if ((o = r.constructor) && o.getDerivedStateFromError != null && (r.setState(o.getDerivedStateFromError(t)), a = r.__d), r.componentDidCatch != null && (r.componentDidCatch(t, i || {}), a = r.__d), a) return r.__E = r;
  } catch (l) {
    t = l;
  }
  throw t;
} }, rt = 0, st = function(t) {
  return t != null && t.constructor === void 0;
}, ee.prototype.setState = function(t, e) {
  var n;
  n = this.__s != null && this.__s != this.state ? this.__s : this.__s = R({}, this.state), typeof t == "function" && (t = t(R({}, n), this.props)), t && R(n, t), t != null && this.__v && (e && this._sb.push(e), Ge(this));
}, ee.prototype.forceUpdate = function(t) {
  this.__v && (this.__e = !0, t && this.__h.push(t), Ge(this));
}, ee.prototype.render = U, F = [], at = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, lt = function(t, e) {
  return t.__v.__b - e.__v.__b;
}, pe.__r = 0, ct = /(PointerCapture)$|Capture$/i, He = 0, Ie = je(!1), Ce = je(!0);
var oe, w, Se, Ke, he = 0, gt = [], x = m, Je = x.__b, Ye = x.__r, Ze = x.diffed, Qe = x.__c, Xe = x.unmount, et = x.__;
function Ue(t, e) {
  x.__h && x.__h(w, t, he || e), he = 0;
  var n = w.__H || (w.__H = { __: [], __h: [] });
  return t >= n.__.length && n.__.push({}), n.__[t];
}
function H(t) {
  return he = 1, Wt(bt, t);
}
function Wt(t, e, n) {
  var i = Ue(oe++, 2);
  if (i.t = t, !i.__c && (i.__ = [bt(void 0, e), function(l) {
    var u = i.__N ? i.__N[0] : i.__[0], c = i.t(u, l);
    u !== c && (i.__N = [c, i.__[1]], i.__c.setState({}));
  }], i.__c = w, !w.__f)) {
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
    w.__f = !0;
    var o = w.shouldComponentUpdate, a = w.componentWillUpdate;
    w.componentWillUpdate = function(l, u, c) {
      if (this.__e) {
        var _ = o;
        o = void 0, r(l, u, c), o = _;
      }
      a && a.call(this, l, u, c);
    }, w.shouldComponentUpdate = r;
  }
  return i.__N || i.__;
}
function X(t, e) {
  var n = Ue(oe++, 3);
  !x.__s && yt(n.__H, e) && (n.__ = t, n.u = e, w.__H.__h.push(n));
}
function G(t) {
  return he = 5, ze(function() {
    return { current: t };
  }, []);
}
function ze(t, e) {
  var n = Ue(oe++, 7);
  return yt(n.__H, e) && (n.__ = t(), n.__H = e, n.__h = t), n.__;
}
function Bt() {
  for (var t; t = gt.shift(); ) {
    var e = t.__H;
    if (t.__P && e) try {
      e.__h.some(fe), e.__h.some(Ne), e.__h = [];
    } catch (n) {
      e.__h = [], x.__e(n, t.__v);
    }
  }
}
x.__b = function(t) {
  w = null, Je && Je(t);
}, x.__ = function(t, e) {
  t && e.__k && e.__k.__m && (t.__m = e.__k.__m), et && et(t, e);
}, x.__r = function(t) {
  Ye && Ye(t), oe = 0;
  var e = (w = t.__c).__H;
  e && (Se === w ? (e.__h = [], w.__h = [], e.__.some(function(n) {
    n.__N && (n.__ = n.__N), n.u = n.__N = void 0;
  })) : (e.__h.some(fe), e.__h.some(Ne), e.__h = [], oe = 0)), Se = w;
}, x.diffed = function(t) {
  Ze && Ze(t);
  var e = t.__c;
  e && e.__H && (e.__H.__h.length && (gt.push(e) !== 1 && Ke === x.requestAnimationFrame || ((Ke = x.requestAnimationFrame) || qt)(Bt)), e.__H.__.some(function(n) {
    n.u && (n.__H = n.u), n.u = void 0;
  })), Se = w = null;
}, x.__c = function(t, e) {
  e.some(function(n) {
    try {
      n.__h.some(fe), n.__h = n.__h.filter(function(i) {
        return !i.__ || Ne(i);
      });
    } catch (i) {
      e.some(function(r) {
        r.__h && (r.__h = []);
      }), e = [], x.__e(i, n.__v);
    }
  }), Qe && Qe(t, e);
}, x.unmount = function(t) {
  Xe && Xe(t);
  var e, n = t.__c;
  n && n.__H && (n.__H.__.some(function(i) {
    try {
      fe(i);
    } catch (r) {
      e = r;
    }
  }), n.__H = void 0, e && x.__e(e, n.__v));
};
var tt = typeof requestAnimationFrame == "function";
function qt(t) {
  var e, n = function() {
    clearTimeout(i), tt && cancelAnimationFrame(e), setTimeout(t);
  }, i = setTimeout(n, 35);
  tt && (e = requestAnimationFrame(n));
}
function fe(t) {
  var e = w, n = t.__c;
  typeof n == "function" && (t.__c = void 0, n()), w = e;
}
function Ne(t) {
  var e = w;
  t.__c = t.__(), w = e;
}
function yt(t, e) {
  return !t || t.length !== e.length || e.some(function(n, i) {
    return n !== t[i];
  });
}
function bt(t, e) {
  return typeof e == "function" ? e(t) : e;
}
var Gt = Symbol.for("preact-signals");
function xe() {
  if (D > 1)
    D--;
  else {
    for (var t, e = !1; te !== void 0; ) {
      var n = te;
      for (te = void 0, Pe++; n !== void 0; ) {
        var i = n.o;
        if (n.o = void 0, n.f &= -3, !(8 & n.f) && kt(n)) try {
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
function Vt(t) {
  if (D > 0) return t();
  D++;
  try {
    return t();
  } finally {
    xe();
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
var te = void 0, D = 0, Pe = 0, ve = 0;
function xt(t) {
  if (v !== void 0) {
    var e = t.n;
    if (e === void 0 || e.t !== v)
      return e = { i: 0, S: t, p: v.s, n: void 0, t: v, e: void 0, x: void 0, r: e }, v.s !== void 0 && (v.s.n = e), v.s = e, t.n = e, 32 & v.f && t.S(e), e;
    if (e.i === -1)
      return e.i = 0, e.n !== void 0 && (e.n.p = e.p, e.p !== void 0 && (e.p.n = e.n), e.p = v.s, e.n = void 0, v.s.n = e, v.s = e), e;
  }
}
function $(t, e) {
  this.v = t, this.i = 0, this.n = void 0, this.t = void 0, this.W = e?.watched, this.Z = e?.unwatched, this.name = e?.name;
}
$.prototype.brand = Gt;
$.prototype.h = function() {
  return !0;
};
$.prototype.S = function(t) {
  var e = this, n = this.t;
  n !== t && t.e === void 0 && (t.x = n, this.t = t, n !== void 0 ? n.e = t : wt(function() {
    var i;
    (i = e.W) == null || i.call(e);
  }));
};
$.prototype.U = function(t) {
  var e = this;
  if (this.t !== void 0) {
    var n = t.e, i = t.x;
    n !== void 0 && (n.x = i, t.e = void 0), i !== void 0 && (i.e = n, t.x = void 0), t === this.t && (this.t = i, i === void 0 && wt(function() {
      var r;
      (r = e.Z) == null || r.call(e);
    }));
  }
};
$.prototype.subscribe = function(t) {
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
$.prototype.valueOf = function() {
  return this.value;
};
$.prototype.toString = function() {
  return this.value + "";
};
$.prototype.toJSON = function() {
  return this.value;
};
$.prototype.peek = function() {
  var t = v;
  v = void 0;
  try {
    return this.value;
  } finally {
    v = t;
  }
};
Object.defineProperty($.prototype, "value", { get: function() {
  var t = xt(this);
  return t !== void 0 && (t.i = this.i), this.v;
}, set: function(t) {
  if (t !== this.v) {
    if (Pe > 100) throw new Error("Cycle detected");
    this.v = t, this.i++, ve++, D++;
    try {
      for (var e = this.t; e !== void 0; e = e.x) e.t.N();
    } finally {
      xe();
    }
  }
} });
function C(t, e) {
  return new $(t, e);
}
function kt(t) {
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
function $t(t) {
  for (var e = t.s, n = void 0; e !== void 0; ) {
    var i = e.p;
    e.i === -1 ? (e.S.U(e), i !== void 0 && (i.n = e.n), e.n !== void 0 && (e.n.p = i)) : n = e, e.S.n = e.r, e.r !== void 0 && (e.r = void 0), e = i;
  }
  t.s = n;
}
function W(t, e) {
  $.call(this, void 0), this.x = t, this.s = void 0, this.g = ve - 1, this.f = 4, this.W = e?.watched, this.Z = e?.unwatched, this.name = e?.name;
}
W.prototype = new $();
W.prototype.h = function() {
  if (this.f &= -3, 1 & this.f) return !1;
  if ((36 & this.f) == 32 || (this.f &= -5, this.g === ve)) return !0;
  if (this.g = ve, this.f |= 1, this.i > 0 && !kt(this))
    return this.f &= -2, !0;
  var t = v;
  try {
    St(this), v = this;
    var e = this.x();
    (16 & this.f || this.v !== e || this.i === 0) && (this.v = e, this.f &= -17, this.i++);
  } catch (n) {
    this.v = n, this.f |= 16, this.i++;
  }
  return v = t, $t(this), this.f &= -2, !0;
};
W.prototype.S = function(t) {
  if (this.t === void 0) {
    this.f |= 36;
    for (var e = this.s; e !== void 0; e = e.n) e.S.S(e);
  }
  $.prototype.S.call(this, t);
};
W.prototype.U = function(t) {
  if (this.t !== void 0 && ($.prototype.U.call(this, t), this.t === void 0)) {
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
  var t = xt(this);
  if (this.h(), t !== void 0 && (t.i = this.i), 16 & this.f) throw this.v;
  return this.v;
} });
function me(t, e) {
  return new W(t, e);
}
function Tt(t) {
  var e = t.u;
  if (t.u = void 0, typeof e == "function") {
    D++;
    var n = v;
    v = void 0;
    try {
      e();
    } catch (i) {
      throw t.f &= -2, t.f |= 8, Le(t), i;
    } finally {
      v = n, xe();
    }
  }
}
function Le(t) {
  for (var e = t.s; e !== void 0; e = e.n) e.S.U(e);
  t.x = void 0, t.s = void 0, Tt(t);
}
function jt(t) {
  if (v !== this) throw new Error("Out-of-order effect");
  $t(this), v = t, this.f &= -2, 8 & this.f && Le(this), xe();
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
  this.f |= 1, this.f &= -9, Tt(this), St(this), D++;
  var t = v;
  return v = this, jt.bind(this, t);
};
K.prototype.N = function() {
  2 & this.f || (this.f |= 2, this.o = te, te = this);
};
K.prototype.d = function() {
  this.f |= 8, 1 & this.f || Le(this);
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
var It, ce, Kt = typeof window < "u" && !!window.__PREACT_SIGNALS_DEVTOOLS__, Ct = [];
re(function() {
  It = this.N;
})();
function J(t, e) {
  m[t] = e.bind(null, m[t] || function() {
  });
}
function ge(t) {
  if (ce) {
    var e = ce;
    ce = void 0, e();
  }
  ce = t && t.S();
}
function Et(t) {
  var e = this, n = t.data, i = Nt(n);
  i.value = n;
  var r = ze(function() {
    for (var l = e, u = e.__v; u = u.__; ) if (u.__c) {
      u.__c.__$f |= 4;
      break;
    }
    var c = me(function() {
      var d = i.value.value;
      return d === 0 ? 0 : d === !0 ? "" : d || "";
    }), _ = me(function() {
      return !Array.isArray(c.value) && !st(c.value);
    }), s = re(function() {
      if (this.N = Pt, _.value) {
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
Et.displayName = "ReactiveTextNode";
Object.defineProperties($.prototype, { constructor: { configurable: !0, value: void 0 }, type: { configurable: !0, value: Et }, props: { configurable: !0, get: function() {
  return { data: this };
} }, __b: { configurable: !0, value: 1 } });
J("__b", function(t, e) {
  if (typeof e.type == "string") {
    var n, i = e.props;
    for (var r in i) if (r !== "children") {
      var o = i[r];
      o instanceof $ && (n || (e.__np = n = {}), n[r] = o, i[r] = o.peek());
    }
  }
  t(e);
});
J("__r", function(t, e) {
  if (t(e), e.type !== U) {
    ge();
    var n, i = e.__c;
    i && (i.__$f &= -2, (n = i.__$u) === void 0 && (i.__$u = n = (function(r, o) {
      var a;
      return re(function() {
        a = this;
      }, { name: o }), a.c = r, a;
    })(function() {
      var r;
      Kt && ((r = n.y) == null || r.call(n)), i.__$f |= 1, i.setState({});
    }, typeof e.type == "function" ? e.type.displayName || e.type.name : ""))), ge(n);
  }
});
J("__e", function(t, e, n, i) {
  ge(), t(e, n, i);
});
J("diffed", function(t, e) {
  ge();
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
        c === void 0 ? (c = Jt(n, u, _), o[u] = c) : c.o(_, r);
      }
      for (var s in i) r[s] = i[s];
    }
  }
  t(e);
});
function Jt(t, e, n, i) {
  var r = e in t && t.ownerSVGElement === void 0, o = C(n), a = n.peek();
  return { o: function(l, u) {
    o.value = l, a = l.peek();
  }, d: re(function() {
    this.N = Pt;
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
function Nt(t, e) {
  return ze(function() {
    return C(t, e);
  }, []);
}
var Yt = function(t) {
  queueMicrotask(function() {
    queueMicrotask(t);
  });
};
function Zt() {
  Vt(function() {
    for (var t; t = Ct.shift(); ) It.call(t);
  });
}
function Pt() {
  Ct.push(this) === 1 && (m.requestAnimationFrame || Yt)(Zt);
}
const E = C(!1), nt = C(!1), T = C([]), k = C(null), j = C(null), A = C(null), z = C(null), Q = C(""), ne = C(!1), ye = C(!1), I = C({
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
}), Ot = C(!1), Qt = me(
  () => I.value.requireEmail && !z.value && !k.value
), Xt = me(() => !!k.value), At = "guddesk_state";
function Fe() {
  try {
    localStorage.setItem(
      At,
      JSON.stringify({
        conversationId: k.value,
        visitorId: j.value,
        visitorToken: A.value,
        visitorEmail: z.value
      })
    );
  } catch {
  }
}
function en() {
  try {
    const t = localStorage.getItem(At);
    if (!t) return;
    const e = JSON.parse(t);
    e.conversationId && (k.value = e.conversationId), e.visitorId && (j.value = e.visitorId), e.visitorToken && (A.value = e.visitorToken), e.visitorEmail && (z.value = e.visitorEmail);
  } catch {
  }
}
function tn(t, e, n) {
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
function nn(t) {
  const e = { ...t.extra };
  return t.hasBody && (e["Content-Type"] = "application/json"), t.visitorToken && (e["x-visitor-token"] = t.visitorToken), e;
}
let se = "", Ht = "";
function on(t, e) {
  se = t, Ht = e.replace(/\/$/, "");
}
async function Y(t, e = {}) {
  const n = nn({
    hasBody: !!e.body,
    visitorToken: A.value,
    extra: e.headers
  }), i = await fetch(`${Ht}${t}`, { ...e, headers: n });
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
  I.value = t, Ot.value = !0;
}
async function sn() {
  if (A.value && j.value) return;
  const t = await Y(
    "/api/widget/auth",
    { method: "POST", body: JSON.stringify({ appId: se }) }
  );
  j.value = t.visitorId, A.value = t.visitorToken, Fe();
}
async function We(t) {
  const e = await Y(
    "/api/widget/visitors",
    {
      method: "POST",
      body: JSON.stringify(
        tn(se, A.value, t)
      )
    }
  );
  j.value = e.visitorId, A.value = e.visitorToken, t.email && (z.value = t.email), Fe();
}
let an = 0;
function Rt(t) {
  const e = `_opt_${++an}`, n = {
    id: e,
    body: t,
    type: "VISITOR",
    senderName: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    _sending: !0
  };
  return T.value = [...T.value, n], e;
}
function Oe(t, e) {
  e ? T.value = T.value.map((n) => n.id === t ? e : n) : T.value = T.value.map(
    (n) => n.id === t ? { ...n, _sending: !1 } : n
  );
}
async function ln(t) {
  const e = Rt(t);
  try {
    const n = await Y("/api/widget/conversations", {
      method: "POST",
      body: JSON.stringify({
        appId: se,
        visitorToken: A.value,
        message: t,
        visitorName: null,
        visitorEmail: z.value
      })
    });
    k.value = n.conversationId, j.value = n.visitorId, A.value = n.visitorToken, T.value = n.messages, Fe();
  } catch {
    Oe(e, null);
  }
}
async function cn(t) {
  if (!k.value)
    return ln(t);
  const e = Rt(t);
  try {
    const n = await Y(
      `/api/widget/conversations/${k.value}/messages`,
      { method: "POST", body: JSON.stringify({ message: t }) }
    );
    Oe(e, n);
  } catch {
    Oe(e, null);
  }
}
async function $e() {
  if (!k.value) return;
  const t = await Y(
    `/api/widget/conversations/${k.value}/messages`
  );
  T.value = t.messages;
}
const un = "https://www.guddesk.com", fn = /* @__PURE__ */ new Set([
  "cdn.guddesk.com",
  "www.guddesk.com",
  "guddesk.com"
]);
function dn(t, e, n) {
  if (n)
    return n.replace(/\/$/, "");
  if (t)
    try {
      const i = new URL(t);
      if (fn.has(i.hostname))
        return un;
      if (i.hostname.includes("guddesk") || t.includes("widget"))
        return i.origin;
    } catch {
    }
  return e;
}
function _n(t) {
  for (let e = t.length - 1; e >= 0; e--) {
    const n = t[e]?.src;
    if (n && (n.includes("guddesk") || n.includes("widget")))
      return n;
  }
}
var pn = 0;
function f(t, e, n, i, r, o) {
  e || (e = {});
  var a, l, u = e;
  if ("ref" in u) for (l in u = {}, e) l == "ref" ? a = e[l] : u[l] = e[l];
  var c = { type: t, props: u, key: n, ref: a, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --pn, __i: -1, __u: 0, __source: r, __self: o };
  if (typeof t == "function" && (a = t.defaultProps)) for (l in a) u[l] === void 0 && (u[l] = a[l]);
  return m.vnode && m.vnode(c), c;
}
function hn(t) {
  const e = t.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/\*\*/g, "{{GLOBSTAR}}").replace(/\*/g, "[^/]*").replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${e}$`);
}
function vn(t, e, n) {
  if (!n || n.length === 0) return !0;
  const i = n.some((r) => {
    try {
      return hn(r).test(t);
    } catch {
      return !1;
    }
  });
  return e === "exclude" ? !i : i;
}
let O = null, N = null, q = null;
const mn = 8e3;
async function gn(t, e, n) {
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
            "x-visitor-token": A.value ?? ""
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
    }, mn);
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
  }), O = r, O;
}
function it() {
  if (!O || !k.value) return;
  N && (N.unbind_all(), O.unsubscribe(N.name));
  const t = `private-visitor-${k.value}`;
  N = O.subscribe(t), N.bind("message:created", (e) => {
    T.value.some((n) => n.id === e.id) || (T.value = [...T.value, e]);
  }), N.bind("typing:start", () => {
    ne.value = !0, q && clearTimeout(q), q = setTimeout(() => {
      ne.value = !1;
    }, 4e3);
  }), N.bind("typing:stop", () => {
    ne.value = !1, q && (clearTimeout(q), q = null);
  });
}
function Te() {
  return O?.connection?.state === "connected";
}
function yn() {
  N && (N.unbind_all(), O?.unsubscribe(N.name), N = null), O && (O.disconnect(), O = null);
}
function bn(t, e) {
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
const wn = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', xn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', kn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function Sn() {
  return /* @__PURE__ */ f("div", { class: "fc-header", style: { position: "relative" }, children: [
    /* @__PURE__ */ f("div", { class: "fc-header-title", children: I.value.workspaceName || "Support" }),
    /* @__PURE__ */ f("div", { class: "fc-header-subtitle", children: "We typically reply in a few minutes" }),
    /* @__PURE__ */ f(
      "button",
      {
        class: "fc-header-close",
        onClick: () => E.value = !1,
        "aria-label": "Close chat",
        dangerouslySetInnerHTML: { __html: xn }
      }
    )
  ] });
}
function $n(t) {
  try {
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function ot() {
  const t = G(null);
  return X(() => {
    t.current?.scrollIntoView({ behavior: "smooth" });
  }, [T.value.length, ne.value]), Xt.value ? /* @__PURE__ */ f("div", { class: "fc-messages", children: [
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
                ] }) : $n(e.createdAt) })
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
function Tn() {
  const t = G(null);
  async function e() {
    const i = Q.value.trim();
    !i || nt.value || (Q.value = "", await cn(i), t.current?.focus());
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
        disabled: !Q.value.trim() || nt.value,
        children: "Send"
      }
    )
  ] });
}
function In() {
  const [t, e] = H(""), [n, i] = H(""), [r, o] = H(!1);
  async function a(l) {
    l.preventDefault();
    const u = t.trim();
    if (!u || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) {
      i("Please enter a valid email address.");
      return;
    }
    o(!0), i("");
    try {
      await We({ email: u }), z.value = u;
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
function Cn() {
  const [t, e] = H(""), [n, i] = H(z.value ?? ""), [r, o] = H(""), [a, l] = H(!1), [u, c] = H(!1), [_, s] = H("");
  async function p(h) {
    h.preventDefault();
    const S = n.trim();
    if (!S || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S)) {
      s("Please enter a valid email address.");
      return;
    }
    c(!0), s("");
    try {
      await We({
        email: S,
        name: t.trim() || void 0
      }), z.value = S, l(!0);
    } catch {
      s("Something went wrong. Please try again.");
    } finally {
      c(!1);
    }
  }
  function d() {
    ye.value = !1;
  }
  return a ? /* @__PURE__ */ f("div", { class: "fc-offline-form", children: /* @__PURE__ */ f("div", { class: "fc-offline-success", children: [
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
function En() {
  return /* @__PURE__ */ f("div", { class: "fc-window", children: [
    /* @__PURE__ */ f(Sn, {}),
    Qt.value ? /* @__PURE__ */ f(In, {}) : ye.value ? /* @__PURE__ */ f(U, { children: [
      /* @__PURE__ */ f(ot, {}),
      /* @__PURE__ */ f(Cn, {})
    ] }) : /* @__PURE__ */ f(U, { children: [
      /* @__PURE__ */ f(ot, {}),
      /* @__PURE__ */ f(Tn, {})
    ] }),
    I.value.showBranding && /* @__PURE__ */ f("div", { class: "fc-branding", children: [
      "Powered by",
      " ",
      /* @__PURE__ */ f("a", { href: "https://guddesk.com", target: "_blank", rel: "noopener", children: "GudDesk" })
    ] })
  ] });
}
function Nn() {
  return /* @__PURE__ */ f(
    "button",
    {
      class: "fc-bubble",
      onClick: () => E.value = !E.value,
      "aria-label": E.value ? "Close chat" : "Open chat",
      dangerouslySetInnerHTML: {
        __html: E.value ? kn : wn
      }
    }
  );
}
const Pn = 4e3;
function On({ appId: t, baseUrl: e, pusherKey: n, pusherCluster: i }) {
  const r = G(null), o = G(!1), a = G(null), l = G(0), u = Nt(!1);
  function c() {
    _(), r.current = setInterval(() => {
      k.value && E.value && $e().catch(() => {
      });
    }, Pn);
  }
  function _() {
    r.current && (clearInterval(r.current), r.current = null);
  }
  async function s(p, d) {
    if (!o.current) {
      o.current = !0;
      try {
        await gn(p, d, `${e}/api/pusher/auth`), k.value && it(), _();
      } catch {
        o.current = !1, c();
      }
    }
  }
  return X(() => (en(), on(t, e), Promise.all([
    rn().catch(() => {
    }),
    sn().catch(() => {
    })
  ]).then(() => {
    if (!vn(
      window.location.pathname,
      I.value.pageVisibilityMode,
      I.value.pageVisibilityPatterns
    )) {
      u.value = !0;
      return;
    }
    k.value && $e().catch(() => {
    });
    const d = n || I.value.pusherKey, h = i || I.value.pusherCluster;
    d && h ? s(d, h) : c();
  }), () => {
    yn(), _();
  }), []), X(() => {
    k.value && (Te() ? it() : r.current || c());
  }, [k.value]), X(() => {
    E.value && k.value && !Te() ? ($e().catch(() => {
    }), c()) : !E.value && !Te() && _();
  }, [E.value]), X(() => {
    const p = I.value.offlineFormTimeout;
    if (!p || !k.value) return;
    const d = T.value, h = d.filter((b) => b.type === "VISITOR").length;
    if (d.some((b) => b.type === "AGENT" || b.type === "BOT")) {
      ye.value = !1, a.current && (clearTimeout(a.current), a.current = null), l.current = h;
      return;
    }
    return h > l.current && (l.current = h, a.current && clearTimeout(a.current), a.current = setTimeout(() => {
      T.value.some((g) => g.type === "AGENT" || g.type === "BOT") || (ye.value = !0);
    }, p * 60 * 1e3)), () => {
      a.current && (clearTimeout(a.current), a.current = null);
    };
  }, [T.value, k.value, I.value.offlineFormTimeout]), !Ot.value || u.value ? null : /* @__PURE__ */ f(U, { children: [
    /* @__PURE__ */ f("style", { children: bn(I.value.primaryColor, I.value.position) }),
    /* @__PURE__ */ f("div", { class: "fc-container", children: [
      E.value && /* @__PURE__ */ f(En, {}),
      /* @__PURE__ */ f(Nn, {})
    ] })
  ] });
}
let ie = null;
function An(t) {
  const e = Array.from(document.querySelectorAll("script[src]")).map(
    (n) => ({ src: n.src })
  );
  return dn(
    _n(e),
    window.location.origin,
    t
  );
}
function Ae(t) {
  if (ie) return;
  const e = t.appId;
  if (!e) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }
  const n = An(t.baseUrl), i = document.createElement("div");
  i.id = "guddesk-widget", document.body.appendChild(i), ie = i.attachShadow({ mode: "open" }), mt(
    ut(On, {
      appId: e,
      baseUrl: n,
      pusherKey: t.pusherKey,
      pusherCluster: t.pusherCluster
    }),
    ie
  );
}
function Hn() {
  const t = document.getElementById("guddesk-widget");
  t && (mt(null, ie), t.remove(), ie = null);
}
const Rn = {
  init: Ae,
  identify: (t) => We(t),
  open: () => {
    E.value = !0;
  },
  close: () => {
    E.value = !1;
  },
  destroy: Hn
};
window.GudDesk = Rn;
window.GudDeskSettings && (document.readyState === "loading" ? document.addEventListener(
  "DOMContentLoaded",
  () => Ae(window.GudDeskSettings)
) : Ae(window.GudDeskSettings));
export {
  Rn as default
};
