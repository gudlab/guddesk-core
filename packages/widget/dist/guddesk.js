function Ss(n, t) {
  for (var s = 0; s < t.length; s++) {
    const a = t[s];
    if (typeof a != "string" && !Array.isArray(a)) {
      for (const l in a)
        if (l !== "default" && !(l in n)) {
          const u = Object.getOwnPropertyDescriptor(a, l);
          u && Object.defineProperty(n, l, u.get ? u : {
            enumerable: !0,
            get: () => a[l]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
var st, I, Rn, In, ve, gn, Nn, $n, Un, $t, Ct, Tt, Ke = {}, Ye = [], xs = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, ot = Array.isArray;
function ce(n, t) {
  for (var s in t) n[s] = t[s];
  return n;
}
function Ut(n) {
  n && n.parentNode && n.parentNode.removeChild(n);
}
function Dn(n, t, s) {
  var a, l, u, h = {};
  for (u in t) u == "key" ? a = t[u] : u == "ref" ? l = t[u] : h[u] = t[u];
  if (arguments.length > 2 && (h.children = arguments.length > 3 ? st.call(arguments, 2) : s), typeof n == "function" && n.defaultProps != null) for (u in n.defaultProps) h[u] === void 0 && (h[u] = n.defaultProps[u]);
  return Xe(n, h, a, l, null);
}
function Xe(n, t, s, a, l) {
  var u = { type: n, props: t, key: s, ref: a, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: l ?? ++Rn, __i: -1, __u: 0 };
  return l == null && I.vnode != null && I.vnode(u), u;
}
function le(n) {
  return n.children;
}
function Le(n, t) {
  this.props = n, this.context = t;
}
function Se(n, t) {
  if (t == null) return n.__ ? Se(n.__, n.__i + 1) : null;
  for (var s; t < n.__k.length; t++) if ((s = n.__k[t]) != null && s.__e != null) return s.__e;
  return typeof n.type == "function" ? Se(n) : null;
}
function ks(n) {
  if (n.__P && n.__d) {
    var t = n.__v, s = t.__e, a = [], l = [], u = ce({}, t);
    u.__v = t.__v + 1, I.vnode && I.vnode(u), Dt(n.__P, u, t, n.__n, n.__P.namespaceURI, 32 & t.__u ? [s] : null, a, s ?? Se(t), !!(32 & t.__u), l), u.__v = t.__v, u.__.__k[u.__i] = u, zn(a, u, l), t.__e = t.__ = null, u.__e != s && Hn(u);
  }
}
function Hn(n) {
  if ((n = n.__) != null && n.__c != null) return n.__e = n.__c.base = null, n.__k.some(function(t) {
    if (t != null && t.__e != null) return n.__e = n.__c.base = t.__e;
  }), Hn(n);
}
function mn(n) {
  (!n.__d && (n.__d = !0) && ve.push(n) && !Qe.__r++ || gn != I.debounceRendering) && ((gn = I.debounceRendering) || Nn)(Qe);
}
function Qe() {
  for (var n, t = 1; ve.length; ) ve.length > t && ve.sort($n), n = ve.shift(), t = ve.length, ks(n);
  Qe.__r = 0;
}
function Mn(n, t, s, a, l, u, h, p, _, v, y) {
  var d, S, m, T, C, g, b, k = a && a.__k || Ye, A = t.length;
  for (_ = Cs(s, t, k, _, A), d = 0; d < A; d++) (m = s.__k[d]) != null && (S = m.__i != -1 && k[m.__i] || Ke, m.__i = d, g = Dt(n, m, S, l, u, h, p, _, v, y), T = m.__e, m.ref && S.ref != m.ref && (S.ref && Ht(S.ref, null, m), y.push(m.ref, m.__c || T, m)), C == null && T != null && (C = T), (b = !!(4 & m.__u)) || S.__k === m.__k ? _ = jn(m, _, n, b) : typeof m.type == "function" && g !== void 0 ? _ = g : T && (_ = T.nextSibling), m.__u &= -7);
  return s.__e = C, _;
}
function Cs(n, t, s, a, l) {
  var u, h, p, _, v, y = s.length, d = y, S = 0;
  for (n.__k = new Array(l), u = 0; u < l; u++) (h = t[u]) != null && typeof h != "boolean" && typeof h != "function" ? (typeof h == "string" || typeof h == "number" || typeof h == "bigint" || h.constructor == String ? h = n.__k[u] = Xe(null, h, null, null, null) : ot(h) ? h = n.__k[u] = Xe(le, { children: h }, null, null, null) : h.constructor === void 0 && h.__b > 0 ? h = n.__k[u] = Xe(h.type, h.props, h.key, h.ref ? h.ref : null, h.__v) : n.__k[u] = h, _ = u + S, h.__ = n, h.__b = n.__b + 1, p = null, (v = h.__i = Ts(h, s, _, d)) != -1 && (d--, (p = s[v]) && (p.__u |= 2)), p == null || p.__v == null ? (v == -1 && (l > y ? S-- : l < y && S++), typeof h.type != "function" && (h.__u |= 4)) : v != _ && (v == _ - 1 ? S-- : v == _ + 1 ? S++ : (v > _ ? S-- : S++, h.__u |= 4))) : n.__k[u] = null;
  if (d) for (u = 0; u < y; u++) (p = s[u]) != null && (2 & p.__u) == 0 && (p.__e == a && (a = Se(p)), Bn(p, p));
  return a;
}
function jn(n, t, s, a) {
  var l, u;
  if (typeof n.type == "function") {
    for (l = n.__k, u = 0; l && u < l.length; u++) l[u] && (l[u].__ = n, t = jn(l[u], t, s, a));
    return t;
  }
  n.__e != t && (a && (t && n.type && !t.parentNode && (t = Se(n)), s.insertBefore(n.__e, t || null)), t = n.__e);
  do
    t = t && t.nextSibling;
  while (t != null && t.nodeType == 8);
  return t;
}
function Ts(n, t, s, a) {
  var l, u, h, p = n.key, _ = n.type, v = t[s], y = v != null && (2 & v.__u) == 0;
  if (v === null && p == null || y && p == v.key && _ == v.type) return s;
  if (a > (y ? 1 : 0)) {
    for (l = s - 1, u = s + 1; l >= 0 || u < t.length; ) if ((v = t[h = l >= 0 ? l-- : u++]) != null && (2 & v.__u) == 0 && p == v.key && _ == v.type) return h;
  }
  return -1;
}
function bn(n, t, s) {
  t[0] == "-" ? n.setProperty(t, s ?? "") : n[t] = s == null ? "" : typeof s != "number" || xs.test(t) ? s : s + "px";
}
function Fe(n, t, s, a, l) {
  var u, h;
  e: if (t == "style") if (typeof s == "string") n.style.cssText = s;
  else {
    if (typeof a == "string" && (n.style.cssText = a = ""), a) for (t in a) s && t in s || bn(n.style, t, "");
    if (s) for (t in s) a && s[t] == a[t] || bn(n.style, t, s[t]);
  }
  else if (t[0] == "o" && t[1] == "n") u = t != (t = t.replace(Un, "$1")), h = t.toLowerCase(), t = h in n || t == "onFocusOut" || t == "onFocusIn" ? h.slice(2) : t.slice(2), n.l || (n.l = {}), n.l[t + u] = s, s ? a ? s.u = a.u : (s.u = $t, n.addEventListener(t, u ? Tt : Ct, u)) : n.removeEventListener(t, u ? Tt : Ct, u);
  else {
    if (l == "http://www.w3.org/2000/svg") t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if (t != "width" && t != "height" && t != "href" && t != "list" && t != "form" && t != "tabIndex" && t != "download" && t != "rowSpan" && t != "colSpan" && t != "role" && t != "popover" && t in n) try {
      n[t] = s ?? "";
      break e;
    } catch {
    }
    typeof s == "function" || (s == null || s === !1 && t[4] != "-" ? n.removeAttribute(t) : n.setAttribute(t, t == "popover" && s == 1 ? "" : s));
  }
}
function yn(n) {
  return function(t) {
    if (this.l) {
      var s = this.l[t.type + n];
      if (t.t == null) t.t = $t++;
      else if (t.t < s.u) return;
      return s(I.event ? I.event(t) : t);
    }
  };
}
function Dt(n, t, s, a, l, u, h, p, _, v) {
  var y, d, S, m, T, C, g, b, k, A, $, D, G, K, J, j = t.type;
  if (t.constructor !== void 0) return null;
  128 & s.__u && (_ = !!(32 & s.__u), u = [p = t.__e = s.__e]), (y = I.__b) && y(t);
  e: if (typeof j == "function") try {
    if (b = t.props, k = "prototype" in j && j.prototype.render, A = (y = j.contextType) && a[y.__c], $ = y ? A ? A.props.value : y.__ : a, s.__c ? g = (d = t.__c = s.__c).__ = d.__E : (k ? t.__c = d = new j(b, $) : (t.__c = d = new Le(b, $), d.constructor = j, d.render = Es), A && A.sub(d), d.state || (d.state = {}), d.__n = a, S = d.__d = !0, d.__h = [], d._sb = []), k && d.__s == null && (d.__s = d.state), k && j.getDerivedStateFromProps != null && (d.__s == d.state && (d.__s = ce({}, d.__s)), ce(d.__s, j.getDerivedStateFromProps(b, d.__s))), m = d.props, T = d.state, d.__v = t, S) k && j.getDerivedStateFromProps == null && d.componentWillMount != null && d.componentWillMount(), k && d.componentDidMount != null && d.__h.push(d.componentDidMount);
    else {
      if (k && j.getDerivedStateFromProps == null && b !== m && d.componentWillReceiveProps != null && d.componentWillReceiveProps(b, $), t.__v == s.__v || !d.__e && d.shouldComponentUpdate != null && d.shouldComponentUpdate(b, d.__s, $) === !1) {
        t.__v != s.__v && (d.props = b, d.state = d.__s, d.__d = !1), t.__e = s.__e, t.__k = s.__k, t.__k.some(function(V) {
          V && (V.__ = t);
        }), Ye.push.apply(d.__h, d._sb), d._sb = [], d.__h.length && h.push(d);
        break e;
      }
      d.componentWillUpdate != null && d.componentWillUpdate(b, d.__s, $), k && d.componentDidUpdate != null && d.__h.push(function() {
        d.componentDidUpdate(m, T, C);
      });
    }
    if (d.context = $, d.props = b, d.__P = n, d.__e = !1, D = I.__r, G = 0, k) d.state = d.__s, d.__d = !1, D && D(t), y = d.render(d.props, d.state, d.context), Ye.push.apply(d.__h, d._sb), d._sb = [];
    else do
      d.__d = !1, D && D(t), y = d.render(d.props, d.state, d.context), d.state = d.__s;
    while (d.__d && ++G < 25);
    d.state = d.__s, d.getChildContext != null && (a = ce(ce({}, a), d.getChildContext())), k && !S && d.getSnapshotBeforeUpdate != null && (C = d.getSnapshotBeforeUpdate(m, T)), K = y != null && y.type === le && y.key == null ? qn(y.props.children) : y, p = Mn(n, ot(K) ? K : [K], t, s, a, l, u, h, p, _, v), d.base = t.__e, t.__u &= -161, d.__h.length && h.push(d), g && (d.__E = d.__ = null);
  } catch (V) {
    if (t.__v = null, _ || u != null) if (V.then) {
      for (t.__u |= _ ? 160 : 128; p && p.nodeType == 8 && p.nextSibling; ) p = p.nextSibling;
      u[u.indexOf(p)] = null, t.__e = p;
    } else {
      for (J = u.length; J--; ) Ut(u[J]);
      Pt(t);
    }
    else t.__e = s.__e, t.__k = s.__k, V.then || Pt(t);
    I.__e(V, t, s);
  }
  else u == null && t.__v == s.__v ? (t.__k = s.__k, t.__e = s.__e) : p = t.__e = Ps(s.__e, t, s, a, l, u, h, _, v);
  return (y = I.diffed) && y(t), 128 & t.__u ? void 0 : p;
}
function Pt(n) {
  n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some(Pt));
}
function zn(n, t, s) {
  for (var a = 0; a < s.length; a++) Ht(s[a], s[++a], s[++a]);
  I.__c && I.__c(t, n), n.some(function(l) {
    try {
      n = l.__h, l.__h = [], n.some(function(u) {
        u.call(l);
      });
    } catch (u) {
      I.__e(u, l.__v);
    }
  });
}
function qn(n) {
  return typeof n != "object" || n == null || n.__b > 0 ? n : ot(n) ? n.map(qn) : ce({}, n);
}
function Ps(n, t, s, a, l, u, h, p, _) {
  var v, y, d, S, m, T, C, g = s.props || Ke, b = t.props, k = t.type;
  if (k == "svg" ? l = "http://www.w3.org/2000/svg" : k == "math" ? l = "http://www.w3.org/1998/Math/MathML" : l || (l = "http://www.w3.org/1999/xhtml"), u != null) {
    for (v = 0; v < u.length; v++) if ((m = u[v]) && "setAttribute" in m == !!k && (k ? m.localName == k : m.nodeType == 3)) {
      n = m, u[v] = null;
      break;
    }
  }
  if (n == null) {
    if (k == null) return document.createTextNode(b);
    n = document.createElementNS(l, k, b.is && b), p && (I.__m && I.__m(t, u), p = !1), u = null;
  }
  if (k == null) g === b || p && n.data == b || (n.data = b);
  else {
    if (u = u && st.call(n.childNodes), !p && u != null) for (g = {}, v = 0; v < n.attributes.length; v++) g[(m = n.attributes[v]).name] = m.value;
    for (v in g) m = g[v], v == "dangerouslySetInnerHTML" ? d = m : v == "children" || v in b || v == "value" && "defaultValue" in b || v == "checked" && "defaultChecked" in b || Fe(n, v, null, m, l);
    for (v in b) m = b[v], v == "children" ? S = m : v == "dangerouslySetInnerHTML" ? y = m : v == "value" ? T = m : v == "checked" ? C = m : p && typeof m != "function" || g[v] === m || Fe(n, v, m, g[v], l);
    if (y) p || d && (y.__html == d.__html || y.__html == n.innerHTML) || (n.innerHTML = y.__html), t.__k = [];
    else if (d && (n.innerHTML = ""), Mn(t.type == "template" ? n.content : n, ot(S) ? S : [S], t, s, a, k == "foreignObject" ? "http://www.w3.org/1999/xhtml" : l, u, h, u ? u[0] : s.__k && Se(s, 0), p, _), u != null) for (v = u.length; v--; ) Ut(u[v]);
    p || (v = "value", k == "progress" && T == null ? n.removeAttribute("value") : T != null && (T !== n[v] || k == "progress" && !T || k == "option" && T != g[v]) && Fe(n, v, T, g[v], l), v = "checked", C != null && C != n[v] && Fe(n, v, C, g[v], l));
  }
  return n;
}
function Ht(n, t, s) {
  try {
    if (typeof n == "function") {
      var a = typeof n.__u == "function";
      a && n.__u(), a && t == null || (n.__u = n(t));
    } else n.current = t;
  } catch (l) {
    I.__e(l, s);
  }
}
function Bn(n, t, s) {
  var a, l;
  if (I.unmount && I.unmount(n), (a = n.ref) && (a.current && a.current != n.__e || Ht(a, null, t)), (a = n.__c) != null) {
    if (a.componentWillUnmount) try {
      a.componentWillUnmount();
    } catch (u) {
      I.__e(u, t);
    }
    a.base = a.__P = null;
  }
  if (a = n.__k) for (l = 0; l < a.length; l++) a[l] && Bn(a[l], t, s || typeof n.type != "function");
  s || Ut(n.__e), n.__c = n.__ = n.__e = void 0;
}
function Es(n, t, s) {
  return this.constructor(n, s);
}
function Fn(n, t, s) {
  var a, l, u, h;
  t == document && (t = document.documentElement), I.__ && I.__(n, t), l = (a = !1) ? null : t.__k, u = [], h = [], Dt(t, n = t.__k = Dn(le, null, [n]), l || Ke, Ke, t.namespaceURI, l ? null : t.firstChild ? st.call(t.childNodes) : null, u, l ? l.__e : t.firstChild, a, h), zn(u, n, h);
}
st = Ye.slice, I = { __e: function(n, t, s, a) {
  for (var l, u, h; t = t.__; ) if ((l = t.__c) && !l.__) try {
    if ((u = l.constructor) && u.getDerivedStateFromError != null && (l.setState(u.getDerivedStateFromError(n)), h = l.__d), l.componentDidCatch != null && (l.componentDidCatch(n, a || {}), h = l.__d), h) return l.__E = l;
  } catch (p) {
    n = p;
  }
  throw n;
} }, Rn = 0, In = function(n) {
  return n != null && n.constructor === void 0;
}, Le.prototype.setState = function(n, t) {
  var s;
  s = this.__s != null && this.__s != this.state ? this.__s : this.__s = ce({}, this.state), typeof n == "function" && (n = n(ce({}, s), this.props)), n && ce(s, n), n != null && this.__v && (t && this._sb.push(t), mn(this));
}, Le.prototype.forceUpdate = function(n) {
  this.__v && (this.__e = !0, n && this.__h.push(n), mn(this));
}, Le.prototype.render = le, ve = [], Nn = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, $n = function(n, t) {
  return n.__v.__b - t.__v.__b;
}, Qe.__r = 0, Un = /(PointerCapture)$|Capture$/i, $t = 0, Ct = yn(!1), Tt = yn(!0);
var Os = 0;
function x(n, t, s, a, l, u) {
  t || (t = {});
  var h, p, _ = t;
  if ("ref" in _) for (p in _ = {}, t) p == "ref" ? h = t[p] : _[p] = t[p];
  var v = { type: n, props: _, key: s, ref: h, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --Os, __i: -1, __u: 0, __source: l, __self: u };
  if (typeof n == "function" && (h = n.defaultProps)) for (p in h) _[p] === void 0 && (_[p] = h[p]);
  return I.vnode && I.vnode(v), v;
}
var Ne, M, St, wn, Ze = 0, Wn = [], q = I, Sn = q.__b, xn = q.__r, kn = q.diffed, Cn = q.__c, Tn = q.unmount, Pn = q.__;
function Mt(n, t) {
  q.__h && q.__h(M, n, Ze || t), Ze = 0;
  var s = M.__H || (M.__H = { __: [], __h: [] });
  return n >= s.__.length && s.__.push({}), s.__[n];
}
function ae(n) {
  return Ze = 1, As(Xn, n);
}
function As(n, t, s) {
  var a = Mt(Ne++, 2);
  if (a.t = n, !a.__c && (a.__ = [Xn(void 0, t), function(p) {
    var _ = a.__N ? a.__N[0] : a.__[0], v = a.t(_, p);
    _ !== v && (a.__N = [v, a.__[1]], a.__c.setState({}));
  }], a.__c = M, !M.__f)) {
    var l = function(p, _, v) {
      if (!a.__c.__H) return !0;
      var y = a.__c.__H.__.filter(function(S) {
        return S.__c;
      });
      if (y.every(function(S) {
        return !S.__N;
      })) return !u || u.call(this, p, _, v);
      var d = a.__c.props !== p;
      return y.some(function(S) {
        if (S.__N) {
          var m = S.__[0];
          S.__ = S.__N, S.__N = void 0, m !== S.__[0] && (d = !0);
        }
      }), u && u.call(this, p, _, v) || d;
    };
    M.__f = !0;
    var u = M.shouldComponentUpdate, h = M.componentWillUpdate;
    M.componentWillUpdate = function(p, _, v) {
      if (this.__e) {
        var y = u;
        u = void 0, l(p, _, v), u = y;
      }
      h && h.call(this, p, _, v);
    }, M.shouldComponentUpdate = l;
  }
  return a.__N || a.__;
}
function Ae(n, t) {
  var s = Mt(Ne++, 3);
  !q.__s && Jn(s.__H, t) && (s.__ = n, s.u = t, M.__H.__h.push(s));
}
function ye(n) {
  return Ze = 5, jt(function() {
    return { current: n };
  }, []);
}
function jt(n, t) {
  var s = Mt(Ne++, 7);
  return Jn(s.__H, t) && (s.__ = n(), s.__H = t, s.__h = n), s.__;
}
function Ls() {
  for (var n; n = Wn.shift(); ) {
    var t = n.__H;
    if (n.__P && t) try {
      t.__h.some(Ve), t.__h.some(Et), t.__h = [];
    } catch (s) {
      t.__h = [], q.__e(s, n.__v);
    }
  }
}
q.__b = function(n) {
  M = null, Sn && Sn(n);
}, q.__ = function(n, t) {
  n && t.__k && t.__k.__m && (n.__m = t.__k.__m), Pn && Pn(n, t);
}, q.__r = function(n) {
  xn && xn(n), Ne = 0;
  var t = (M = n.__c).__H;
  t && (St === M ? (t.__h = [], M.__h = [], t.__.some(function(s) {
    s.__N && (s.__ = s.__N), s.u = s.__N = void 0;
  })) : (t.__h.some(Ve), t.__h.some(Et), t.__h = [], Ne = 0)), St = M;
}, q.diffed = function(n) {
  kn && kn(n);
  var t = n.__c;
  t && t.__H && (t.__H.__h.length && (Wn.push(t) !== 1 && wn === q.requestAnimationFrame || ((wn = q.requestAnimationFrame) || Rs)(Ls)), t.__H.__.some(function(s) {
    s.u && (s.__H = s.u), s.u = void 0;
  })), St = M = null;
}, q.__c = function(n, t) {
  t.some(function(s) {
    try {
      s.__h.some(Ve), s.__h = s.__h.filter(function(a) {
        return !a.__ || Et(a);
      });
    } catch (a) {
      t.some(function(l) {
        l.__h && (l.__h = []);
      }), t = [], q.__e(a, s.__v);
    }
  }), Cn && Cn(n, t);
}, q.unmount = function(n) {
  Tn && Tn(n);
  var t, s = n.__c;
  s && s.__H && (s.__H.__.some(function(a) {
    try {
      Ve(a);
    } catch (l) {
      t = l;
    }
  }), s.__H = void 0, t && q.__e(t, s.__v));
};
var En = typeof requestAnimationFrame == "function";
function Rs(n) {
  var t, s = function() {
    clearTimeout(a), En && cancelAnimationFrame(t), setTimeout(n);
  }, a = setTimeout(s, 35);
  En && (t = requestAnimationFrame(s));
}
function Ve(n) {
  var t = M, s = n.__c;
  typeof s == "function" && (n.__c = void 0, s()), M = t;
}
function Et(n) {
  var t = M;
  n.__c = n.__(), M = t;
}
function Jn(n, t) {
  return !n || n.length !== t.length || t.some(function(s, a) {
    return s !== n[a];
  });
}
function Xn(n, t) {
  return typeof t == "function" ? t(n) : t;
}
var Is = Symbol.for("preact-signals");
function at() {
  if (ue > 1)
    ue--;
  else {
    for (var n, t = !1; Re !== void 0; ) {
      var s = Re;
      for (Re = void 0, Ot++; s !== void 0; ) {
        var a = s.o;
        if (s.o = void 0, s.f &= -3, !(8 & s.f) && Kn(s)) try {
          s.c();
        } catch (l) {
          t || (n = l, t = !0);
        }
        s = a;
      }
    }
    if (Ot = 0, ue--, t) throw n;
  }
}
function Ns(n) {
  if (ue > 0) return n();
  ue++;
  try {
    return n();
  } finally {
    at();
  }
}
var R = void 0;
function Vn(n) {
  var t = R;
  R = void 0;
  try {
    return n();
  } finally {
    R = t;
  }
}
var Re = void 0, ue = 0, Ot = 0, et = 0;
function Gn(n) {
  if (R !== void 0) {
    var t = n.n;
    if (t === void 0 || t.t !== R)
      return t = { i: 0, S: n, p: R.s, n: void 0, t: R, e: void 0, x: void 0, r: t }, R.s !== void 0 && (R.s.n = t), R.s = t, n.n = t, 32 & R.f && n.S(t), t;
    if (t.i === -1)
      return t.i = 0, t.n !== void 0 && (t.n.p = t.p, t.p !== void 0 && (t.p.n = t.n), t.p = R.s, t.n = void 0, R.s.n = t, R.s = t), t;
  }
}
function W(n, t) {
  this.v = n, this.i = 0, this.n = void 0, this.t = void 0, this.W = t?.watched, this.Z = t?.unwatched, this.name = t?.name;
}
W.prototype.brand = Is;
W.prototype.h = function() {
  return !0;
};
W.prototype.S = function(n) {
  var t = this, s = this.t;
  s !== n && n.e === void 0 && (n.x = s, this.t = n, s !== void 0 ? s.e = n : Vn(function() {
    var a;
    (a = t.W) == null || a.call(t);
  }));
};
W.prototype.U = function(n) {
  var t = this;
  if (this.t !== void 0) {
    var s = n.e, a = n.x;
    s !== void 0 && (s.x = a, n.e = void 0), a !== void 0 && (a.e = s, n.x = void 0), n === this.t && (this.t = a, a === void 0 && Vn(function() {
      var l;
      (l = t.Z) == null || l.call(t);
    }));
  }
};
W.prototype.subscribe = function(n) {
  var t = this;
  return Ue(function() {
    var s = t.value, a = R;
    R = void 0;
    try {
      n(s);
    } finally {
      R = a;
    }
  }, { name: "sub" });
};
W.prototype.valueOf = function() {
  return this.value;
};
W.prototype.toString = function() {
  return this.value + "";
};
W.prototype.toJSON = function() {
  return this.value;
};
W.prototype.peek = function() {
  var n = R;
  R = void 0;
  try {
    return this.value;
  } finally {
    R = n;
  }
};
Object.defineProperty(W.prototype, "value", { get: function() {
  var n = Gn(this);
  return n !== void 0 && (n.i = this.i), this.v;
}, set: function(n) {
  if (n !== this.v) {
    if (Ot > 100) throw new Error("Cycle detected");
    this.v = n, this.i++, et++, ue++;
    try {
      for (var t = this.t; t !== void 0; t = t.x) t.t.N();
    } finally {
      at();
    }
  }
} });
function Z(n, t) {
  return new W(n, t);
}
function Kn(n) {
  for (var t = n.s; t !== void 0; t = t.n) if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
  return !1;
}
function Yn(n) {
  for (var t = n.s; t !== void 0; t = t.n) {
    var s = t.S.n;
    if (s !== void 0 && (t.r = s), t.S.n = t, t.i = -1, t.n === void 0) {
      n.s = t;
      break;
    }
  }
}
function Qn(n) {
  for (var t = n.s, s = void 0; t !== void 0; ) {
    var a = t.p;
    t.i === -1 ? (t.S.U(t), a !== void 0 && (a.n = t.n), t.n !== void 0 && (t.n.p = a)) : s = t, t.S.n = t.r, t.r !== void 0 && (t.r = void 0), t = a;
  }
  n.s = s;
}
function ge(n, t) {
  W.call(this, void 0), this.x = n, this.s = void 0, this.g = et - 1, this.f = 4, this.W = t?.watched, this.Z = t?.unwatched, this.name = t?.name;
}
ge.prototype = new W();
ge.prototype.h = function() {
  if (this.f &= -3, 1 & this.f) return !1;
  if ((36 & this.f) == 32 || (this.f &= -5, this.g === et)) return !0;
  if (this.g = et, this.f |= 1, this.i > 0 && !Kn(this))
    return this.f &= -2, !0;
  var n = R;
  try {
    Yn(this), R = this;
    var t = this.x();
    (16 & this.f || this.v !== t || this.i === 0) && (this.v = t, this.f &= -17, this.i++);
  } catch (s) {
    this.v = s, this.f |= 16, this.i++;
  }
  return R = n, Qn(this), this.f &= -2, !0;
};
ge.prototype.S = function(n) {
  if (this.t === void 0) {
    this.f |= 36;
    for (var t = this.s; t !== void 0; t = t.n) t.S.S(t);
  }
  W.prototype.S.call(this, n);
};
ge.prototype.U = function(n) {
  if (this.t !== void 0 && (W.prototype.U.call(this, n), this.t === void 0)) {
    this.f &= -33;
    for (var t = this.s; t !== void 0; t = t.n) t.S.U(t);
  }
};
ge.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 6;
    for (var n = this.t; n !== void 0; n = n.x) n.t.N();
  }
};
Object.defineProperty(ge.prototype, "value", { get: function() {
  if (1 & this.f) throw new Error("Cycle detected");
  var n = Gn(this);
  if (this.h(), n !== void 0 && (n.i = this.i), 16 & this.f) throw this.v;
  return this.v;
} });
function tt(n, t) {
  return new ge(n, t);
}
function Zn(n) {
  var t = n.u;
  if (n.u = void 0, typeof t == "function") {
    ue++;
    var s = R;
    R = void 0;
    try {
      t();
    } catch (a) {
      throw n.f &= -2, n.f |= 8, zt(n), a;
    } finally {
      R = s, at();
    }
  }
}
function zt(n) {
  for (var t = n.s; t !== void 0; t = t.n) t.S.U(t);
  n.x = void 0, n.s = void 0, Zn(n);
}
function $s(n) {
  if (R !== this) throw new Error("Out-of-order effect");
  Qn(this), R = n, this.f &= -2, 8 & this.f && zt(this), at();
}
function xe(n, t) {
  this.x = n, this.u = void 0, this.s = void 0, this.o = void 0, this.f = 32, this.name = t?.name;
}
xe.prototype.c = function() {
  var n = this.S();
  try {
    if (8 & this.f || this.x === void 0) return;
    var t = this.x();
    typeof t == "function" && (this.u = t);
  } finally {
    n();
  }
};
xe.prototype.S = function() {
  if (1 & this.f) throw new Error("Cycle detected");
  this.f |= 1, this.f &= -9, Zn(this), Yn(this), ue++;
  var n = R;
  return R = this, $s.bind(this, n);
};
xe.prototype.N = function() {
  2 & this.f || (this.f |= 2, this.o = Re, Re = this);
};
xe.prototype.d = function() {
  this.f |= 8, 1 & this.f || zt(this);
};
xe.prototype.dispose = function() {
  this.d();
};
function Ue(n, t) {
  var s = new xe(n, t);
  try {
    s.c();
  } catch (l) {
    throw s.d(), l;
  }
  var a = s.d.bind(s);
  return a[Symbol.dispose] = a, a;
}
var er, We, Us = typeof window < "u" && !!window.__PREACT_SIGNALS_DEVTOOLS__, tr = [];
Ue(function() {
  er = this.N;
})();
function ke(n, t) {
  I[n] = t.bind(null, I[n] || function() {
  });
}
function nt(n) {
  if (We) {
    var t = We;
    We = void 0, t();
  }
  We = n && n.S();
}
function nr(n) {
  var t = this, s = n.data, a = rr(s);
  a.value = s;
  var l = jt(function() {
    for (var p = t, _ = t.__v; _ = _.__; ) if (_.__c) {
      _.__c.__$f |= 4;
      break;
    }
    var v = tt(function() {
      var m = a.value.value;
      return m === 0 ? 0 : m === !0 ? "" : m || "";
    }), y = tt(function() {
      return !Array.isArray(v.value) && !In(v.value);
    }), d = Ue(function() {
      if (this.N = ir, y.value) {
        var m = v.value;
        p.__v && p.__v.__e && p.__v.__e.nodeType === 3 && (p.__v.__e.data = m);
      }
    }), S = t.__$u.d;
    return t.__$u.d = function() {
      d(), S.call(this);
    }, [y, v];
  }, []), u = l[0], h = l[1];
  return u.value ? h.peek() : h.value;
}
nr.displayName = "ReactiveTextNode";
Object.defineProperties(W.prototype, { constructor: { configurable: !0, value: void 0 }, type: { configurable: !0, value: nr }, props: { configurable: !0, get: function() {
  return { data: this };
} }, __b: { configurable: !0, value: 1 } });
ke("__b", function(n, t) {
  if (typeof t.type == "string") {
    var s, a = t.props;
    for (var l in a) if (l !== "children") {
      var u = a[l];
      u instanceof W && (s || (t.__np = s = {}), s[l] = u, a[l] = u.peek());
    }
  }
  n(t);
});
ke("__r", function(n, t) {
  if (n(t), t.type !== le) {
    nt();
    var s, a = t.__c;
    a && (a.__$f &= -2, (s = a.__$u) === void 0 && (a.__$u = s = (function(l, u) {
      var h;
      return Ue(function() {
        h = this;
      }, { name: u }), h.c = l, h;
    })(function() {
      var l;
      Us && ((l = s.y) == null || l.call(s)), a.__$f |= 1, a.setState({});
    }, typeof t.type == "function" ? t.type.displayName || t.type.name : ""))), nt(s);
  }
});
ke("__e", function(n, t, s, a) {
  nt(), n(t, s, a);
});
ke("diffed", function(n, t) {
  nt();
  var s;
  if (typeof t.type == "string" && (s = t.__e)) {
    var a = t.__np, l = t.props;
    if (a) {
      var u = s.U;
      if (u) for (var h in u) {
        var p = u[h];
        p !== void 0 && !(h in a) && (p.d(), u[h] = void 0);
      }
      else
        u = {}, s.U = u;
      for (var _ in a) {
        var v = u[_], y = a[_];
        v === void 0 ? (v = Ds(s, _, y), u[_] = v) : v.o(y, l);
      }
      for (var d in a) l[d] = a[d];
    }
  }
  n(t);
});
function Ds(n, t, s, a) {
  var l = t in n && n.ownerSVGElement === void 0, u = Z(s), h = s.peek();
  return { o: function(p, _) {
    u.value = p, h = p.peek();
  }, d: Ue(function() {
    this.N = ir;
    var p = u.value.value;
    h !== p ? (h = void 0, l ? n[t] = p : p != null && (p !== !1 || t[4] === "-") ? n.setAttribute(t, p) : n.removeAttribute(t)) : h = void 0;
  }) };
}
ke("unmount", function(n, t) {
  if (typeof t.type == "string") {
    var s = t.__e;
    if (s) {
      var a = s.U;
      if (a) {
        s.U = void 0;
        for (var l in a) {
          var u = a[l];
          u && u.d();
        }
      }
    }
    t.__np = void 0;
  } else {
    var h = t.__c;
    if (h) {
      var p = h.__$u;
      p && (h.__$u = void 0, p.d());
    }
  }
  n(t);
});
ke("__h", function(n, t, s, a) {
  (a < 3 || a === 9) && (t.__$f |= 2), n(t, s, a);
});
Le.prototype.shouldComponentUpdate = function(n, t) {
  if (this.__R) return !0;
  var s = this.__$u, a = s && s.s !== void 0;
  for (var l in t) return !0;
  if (this.__f || typeof this.u == "boolean" && this.u === !0) {
    var u = 2 & this.__$f;
    if (!(a || u || 4 & this.__$f) || 1 & this.__$f) return !0;
  } else if (!(a || 4 & this.__$f) || 3 & this.__$f) return !0;
  for (var h in n) if (h !== "__source" && n[h] !== this.props[h]) return !0;
  for (var p in this.props) if (!(p in n)) return !0;
  return !1;
};
function rr(n, t) {
  return jt(function() {
    return Z(n, t);
  }, []);
}
var Hs = function(n) {
  queueMicrotask(function() {
    queueMicrotask(n);
  });
};
function Ms() {
  Ns(function() {
    for (var n; n = tr.shift(); ) er.call(n);
  });
}
function ir() {
  tr.push(this) === 1 && (I.requestAnimationFrame || Hs)(Ms);
}
const ee = Z(!1), rt = Z(!1), F = Z([]), H = Z(null), $e = Z(null), re = Z(null), he = Z(null), Oe = Z(""), Ie = Z(!1), it = Z(!1), Q = Z({
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
}), sr = Z(!1), js = tt(
  () => Q.value.requireEmail && !he.value && !H.value
), zs = tt(() => !!H.value), or = "guddesk_state";
function At() {
  try {
    localStorage.setItem(
      or,
      JSON.stringify({
        conversationId: H.value,
        visitorId: $e.value,
        visitorToken: re.value,
        visitorEmail: he.value
      })
    );
  } catch {
  }
}
function qs() {
  try {
    const n = localStorage.getItem(or);
    if (!n) return;
    const t = JSON.parse(n);
    t.conversationId && (H.value = t.conversationId), t.visitorId && ($e.value = t.visitorId), t.visitorToken && (re.value = t.visitorToken), t.visitorEmail && (he.value = t.visitorEmail);
  } catch {
  }
}
class ar extends Error {
  constructor(t, s, a) {
    super(t), this.status = s, this.code = a, this.name = "WidgetRequestError";
  }
}
const Bs = "VISITOR_NOT_FOUND";
function Fs(n) {
  return n instanceof ar && n.status === 401 && n.code === Bs;
}
async function Ws(n, t) {
  try {
    return await n();
  } catch (s) {
    if (!Fs(s) || !t.has()) throw s;
    return t.drop(), n();
  }
}
function Js(n) {
  let t = null;
  async function s(a) {
    if (n.hasConversation()) return n.post(a);
    if (!t) {
      const l = n.start(a).finally(() => {
        t === l && (t = null);
      });
      return t = l, l;
    }
    return await t.catch(() => {
    }), s(a);
  }
  return { send: s, isStarting: () => t !== null };
}
let ct = "", cr = "";
function Xs(n, t) {
  ct = n, cr = t.replace(/\/$/, "");
}
async function De(n, t = {}) {
  const s = {
    "Content-Type": "application/json",
    ...t.headers
  };
  re.value && (s["x-visitor-token"] = re.value);
  const a = await fetch(`${cr}${n}`, { ...t, headers: s });
  if (!a.ok) {
    const l = await a.json().catch(() => ({ error: "Request failed" }));
    throw new ar(l.error || "Request failed", a.status, l.code);
  }
  return a.json();
}
async function Vs() {
  const n = await De(
    `/api/widget/config?appId=${encodeURIComponent(ct)}`
  );
  Q.value = n, sr.value = !0;
}
async function qt(n) {
  const t = await De(
    "/api/widget/visitors",
    {
      method: "POST",
      body: JSON.stringify({
        appId: ct,
        visitorToken: re.value,
        externalId: n.userId,
        name: n.name,
        email: n.email,
        metadata: n.metadata,
        userHash: n.userHash
      })
    }
  );
  $e.value = t.visitorId, re.value = t.visitorToken, n.email && (he.value = n.email), At();
}
let Gs = 0;
function ur(n) {
  const t = `_opt_${++Gs}`, s = {
    id: t,
    body: n,
    type: "VISITOR",
    senderName: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    _sending: !0
  };
  return F.value = [...F.value, s], t;
}
function Lt(n, t) {
  t ? F.value = F.value.map((s) => s.id === n ? t : s) : F.value = F.value.map(
    (s) => s.id === n ? { ...s, _sending: !1 } : s
  );
}
async function Ks(n) {
  return De("/api/widget/conversations", {
    method: "POST",
    body: JSON.stringify({
      appId: ct,
      visitorToken: re.value,
      message: n,
      visitorName: null,
      visitorEmail: he.value
    })
  });
}
async function Ys(n) {
  const t = ur(n);
  rt.value = !0;
  try {
    const s = await Ws(() => Ks(n), {
      has: () => !!re.value,
      drop: () => {
        re.value = null, $e.value = null, At();
      }
    });
    H.value = s.conversationId, $e.value = s.visitorId, re.value = s.visitorToken, F.value = [
      ...s.messages,
      ...F.value.filter((a) => a._sending && a.id !== t)
    ], At();
  } catch {
    Lt(t, null);
  } finally {
    rt.value = !1;
  }
}
async function Qs(n) {
  const t = ur(n);
  try {
    const s = await De(
      `/api/widget/conversations/${H.value}/messages`,
      { method: "POST", body: JSON.stringify({ message: n }) }
    );
    Lt(t, s);
  } catch {
    Lt(t, null);
  }
}
const Zs = Js({
  hasConversation: () => !!H.value,
  start: Ys,
  post: Qs
});
function eo(n) {
  return Zs.send(n);
}
async function Je() {
  if (!H.value) return;
  const n = await De(
    `/api/widget/conversations/${H.value}/messages`
  );
  F.value = n.messages;
}
function to(n) {
  const t = n.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/\*\*/g, "{{GLOBSTAR}}").replace(/\*/g, "[^/]*").replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${t}$`);
}
function no(n, t, s) {
  if (!s || s.length === 0) return !0;
  const a = s.some((l) => {
    try {
      return to(l).test(n);
    } catch {
      return !1;
    }
  });
  return t === "exclude" ? !a : a;
}
let te = null, ne = null, be = null, Ge = null;
const ro = 8e3;
async function io(n, t, s) {
  const { default: a } = await Promise.resolve().then(() => Io), l = new a(n, {
    cluster: t,
    channelAuthorization: {
      endpoint: s,
      transport: "ajax",
      customHandler: ({ channelName: u, socketId: h }, p) => {
        fetch(s, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-visitor-token": re.value ?? ""
          },
          body: new URLSearchParams({
            socket_id: h,
            channel_name: u
          }).toString()
        }).then(async (_) => {
          if (!_.ok) {
            p(
              new Error(`Pusher auth failed: ${_.status}`),
              null
            );
            return;
          }
          const v = await _.json();
          p(null, v);
        }).catch((_) => p(_, null));
      }
    }
  });
  return await new Promise((u, h) => {
    const p = setTimeout(() => {
      _();
      try {
        l.disconnect();
      } catch {
      }
      h(new Error("Pusher connection timeout"));
    }, ro);
    function _() {
      clearTimeout(p), l.connection.unbind("connected", v), l.connection.unbind("error", y), l.connection.unbind("unavailable", y), l.connection.unbind("failed", y);
    }
    function v() {
      _(), u();
    }
    function y(d) {
      _();
      try {
        l.disconnect();
      } catch {
      }
      h(d instanceof Error ? d : new Error("Pusher connection error"));
    }
    l.connection.bind("connected", v), l.connection.bind("error", y), l.connection.bind("unavailable", y), l.connection.bind("failed", y);
  }), te = l, te;
}
function so(n) {
  Ge = n, te && te.connection.bind("connected", () => {
    Ge && Ge(), H.value && Rt();
  });
}
function Rt() {
  if (!te || !H.value) return;
  ne && (ne.unbind_all(), te.unsubscribe(ne.name));
  const n = `private-visitor-${H.value}`;
  ne = te.subscribe(n), ne.bind("message:created", (t) => {
    F.value.some((s) => s.id === t.id) || (F.value = [...F.value, t]);
  }), ne.bind("typing:start", () => {
    Ie.value = !0, be && clearTimeout(be), be = setTimeout(() => {
      Ie.value = !1;
    }, 4e3);
  }), ne.bind("typing:stop", () => {
    Ie.value = !1, be && (clearTimeout(be), be = null);
  });
}
function xt() {
  return te?.connection?.state === "connected";
}
function oo() {
  ne && (ne.unbind_all(), te?.unsubscribe(ne.name), ne = null), te && (te.disconnect(), te = null), Ge = null;
}
function ao(n, t) {
  const s = t === "bottom-right";
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
      ${s ? "right: 20px;" : "left: 20px;"}
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: ${s ? "flex-end" : "flex-start"};
    }

    .fc-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${n};
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
      background: ${n};
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
      background: ${n};
      color: white;
      border-bottom-right-radius: 4px;
    }
    .fc-msg-agent {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    .fc-msg-system {
      align-self: center;
      font-size: 11px;
      color: #6b7280;
      background: #f3f4f6;
      border-radius: 999px;
      padding: 4px 12px;
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
      border-color: ${n};
    }
    .fc-send-btn {
      background: ${n};
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
      border-color: ${n};
    }
    .fc-prechat button {
      background: ${n};
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
      border-color: ${n};
    }
    .fc-offline-error {
      font-size: 12px;
      color: #ef4444;
    }
    .fc-offline-submit {
      background: ${n};
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
        ${s ? "right: 12px;" : "left: 12px;"}
      }
    }
  `;
}
const co = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', uo = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', lo = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function ho() {
  return /* @__PURE__ */ x("div", { class: "fc-header", style: { position: "relative" }, children: [
    /* @__PURE__ */ x("div", { class: "fc-header-title", children: Q.value.workspaceName || "Support" }),
    /* @__PURE__ */ x("div", { class: "fc-header-subtitle", children: "We typically reply in a few minutes" }),
    /* @__PURE__ */ x(
      "button",
      {
        class: "fc-header-close",
        onClick: () => ee.value = !1,
        "aria-label": "Close chat",
        dangerouslySetInnerHTML: { __html: uo }
      }
    )
  ] });
}
function fo(n) {
  try {
    return new Date(n).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function On() {
  const n = ye(null);
  return Ae(() => {
    n.current?.scrollIntoView({ behavior: "smooth" });
  }, [F.value.length, Ie.value]), zs.value ? /* @__PURE__ */ x("div", { class: "fc-messages", children: [
    F.value.map(
      (t) => t.type === "SYSTEM" ? /* @__PURE__ */ x("div", { class: "fc-msg-system", children: t.body }, t.id) : /* @__PURE__ */ x(
        "div",
        {
          class: `fc-msg-row ${t.type === "VISITOR" ? "fc-msg-row-visitor" : "fc-msg-row-agent"}`,
          children: [
            t.type !== "VISITOR" && t.senderName && /* @__PURE__ */ x("div", { class: "fc-msg-sender", children: t.senderName }),
            /* @__PURE__ */ x(
              "div",
              {
                class: `fc-msg ${t.type === "VISITOR" ? "fc-msg-visitor" : "fc-msg-agent"}${t._sending ? " fc-msg-sending" : ""}`,
                children: [
                  t.body,
                  /* @__PURE__ */ x("div", { class: "fc-msg-time", children: t._sending ? /* @__PURE__ */ x("span", { class: "fc-sending-indicator", children: [
                    /* @__PURE__ */ x("span", { class: "fc-sending-dot" }),
                    /* @__PURE__ */ x("span", { class: "fc-sending-dot" }),
                    /* @__PURE__ */ x("span", { class: "fc-sending-dot" })
                  ] }) : fo(t.createdAt) })
                ]
              }
            )
          ]
        },
        t.id
      )
    ),
    Ie.value && /* @__PURE__ */ x("div", { class: "fc-typing", children: /* @__PURE__ */ x("span", { class: "fc-typing-dots", children: [
      /* @__PURE__ */ x("span", { children: "." }),
      /* @__PURE__ */ x("span", { children: "." }),
      /* @__PURE__ */ x("span", { children: "." })
    ] }) }),
    /* @__PURE__ */ x("div", { ref: n })
  ] }) : /* @__PURE__ */ x("div", { class: "fc-messages", children: /* @__PURE__ */ x("div", { class: "fc-msg fc-msg-agent", children: Q.value.welcomeMessage }) });
}
function po() {
  const n = ye(null);
  async function t() {
    const a = Oe.value.trim();
    !a || rt.value || (Oe.value = "", await eo(a), n.current?.focus());
  }
  function s(a) {
    a.key === "Enter" && !a.shiftKey && (a.preventDefault(), t());
  }
  return /* @__PURE__ */ x("div", { class: "fc-input-area", children: [
    /* @__PURE__ */ x(
      "textarea",
      {
        ref: n,
        class: "fc-input",
        rows: 1,
        placeholder: "Type a message...",
        value: Oe.value,
        onInput: (a) => {
          Oe.value = a.target.value;
        },
        onKeyDown: s
      }
    ),
    /* @__PURE__ */ x(
      "button",
      {
        class: "fc-send-btn",
        onClick: t,
        disabled: !Oe.value.trim() || rt.value,
        children: "Send"
      }
    )
  ] });
}
function _o() {
  const [n, t] = ae(""), [s, a] = ae(""), [l, u] = ae(!1);
  async function h(p) {
    p.preventDefault();
    const _ = n.trim();
    if (!_ || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_)) {
      a("Please enter a valid email address.");
      return;
    }
    u(!0), a("");
    try {
      await qt({ email: _ }), he.value = _;
    } catch {
      a("Something went wrong. Please try again.");
    } finally {
      u(!1);
    }
  }
  return /* @__PURE__ */ x("form", { class: "fc-prechat", onSubmit: h, children: [
    /* @__PURE__ */ x("label", { children: "Enter your email to start chatting" }),
    /* @__PURE__ */ x(
      "input",
      {
        type: "email",
        placeholder: "you@example.com",
        value: n,
        onInput: (p) => t(p.target.value),
        required: !0
      }
    ),
    s && /* @__PURE__ */ x("div", { style: { color: "#ef4444", fontSize: "12px" }, children: s }),
    /* @__PURE__ */ x("button", { type: "submit", disabled: l, children: l ? "..." : "Start Chat" })
  ] });
}
function vo() {
  const [n, t] = ae(""), [s, a] = ae(he.value ?? ""), [l, u] = ae(""), [h, p] = ae(!1), [_, v] = ae(!1), [y, d] = ae("");
  async function S(T) {
    T.preventDefault();
    const C = s.trim();
    if (!C || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(C)) {
      d("Please enter a valid email address.");
      return;
    }
    v(!0), d("");
    try {
      await qt({
        email: C,
        name: n.trim() || void 0
      }), he.value = C, p(!0);
    } catch {
      d("Something went wrong. Please try again.");
    } finally {
      v(!1);
    }
  }
  function m() {
    it.value = !1;
  }
  return h ? /* @__PURE__ */ x("div", { class: "fc-offline-form", children: /* @__PURE__ */ x("div", { class: "fc-offline-success", children: [
    /* @__PURE__ */ x("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: Q.value.primaryColor, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ x("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
      /* @__PURE__ */ x("polyline", { points: "22 4 12 14.01 9 11.01" })
    ] }),
    /* @__PURE__ */ x("p", { class: "fc-offline-success-title", children: "Thanks! We'll be in touch." }),
    /* @__PURE__ */ x("p", { class: "fc-offline-success-text", children: [
      "We'll get back to you at ",
      /* @__PURE__ */ x("strong", { children: s }),
      " as soon as possible."
    ] }),
    /* @__PURE__ */ x("button", { class: "fc-offline-dismiss", onClick: m, children: "Continue chatting" })
  ] }) }) : /* @__PURE__ */ x("div", { class: "fc-offline-form", children: [
    /* @__PURE__ */ x("div", { class: "fc-offline-header", children: [
      /* @__PURE__ */ x("p", { class: "fc-offline-title", children: "We're not available right now" }),
      /* @__PURE__ */ x("p", { class: "fc-offline-subtitle", children: "Leave your details and we'll get back to you." })
    ] }),
    /* @__PURE__ */ x("form", { class: "fc-offline-fields", onSubmit: S, children: [
      /* @__PURE__ */ x("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ x("label", { children: "Name" }),
        /* @__PURE__ */ x(
          "input",
          {
            type: "text",
            placeholder: "Your name",
            value: n,
            onInput: (T) => t(T.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ x("label", { children: "Email *" }),
        /* @__PURE__ */ x(
          "input",
          {
            type: "email",
            placeholder: "you@example.com",
            value: s,
            onInput: (T) => a(T.target.value),
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ x("label", { children: "Message" }),
        /* @__PURE__ */ x(
          "textarea",
          {
            placeholder: "Anything else you'd like us to know?",
            rows: 3,
            value: l,
            onInput: (T) => u(T.target.value)
          }
        )
      ] }),
      y && /* @__PURE__ */ x("div", { class: "fc-offline-error", children: y }),
      /* @__PURE__ */ x("button", { type: "submit", class: "fc-offline-submit", disabled: _, children: _ ? "Sending..." : "Leave a message" }),
      /* @__PURE__ */ x("button", { type: "button", class: "fc-offline-dismiss", onClick: m, children: "Continue chatting" })
    ] })
  ] });
}
function go() {
  return /* @__PURE__ */ x("div", { class: "fc-window", children: [
    /* @__PURE__ */ x(ho, {}),
    js.value ? /* @__PURE__ */ x(_o, {}) : it.value ? /* @__PURE__ */ x(le, { children: [
      /* @__PURE__ */ x(On, {}),
      /* @__PURE__ */ x(vo, {})
    ] }) : /* @__PURE__ */ x(le, { children: [
      /* @__PURE__ */ x(On, {}),
      /* @__PURE__ */ x(po, {})
    ] }),
    Q.value.showBranding && /* @__PURE__ */ x("div", { class: "fc-branding", children: [
      "Powered by",
      " ",
      /* @__PURE__ */ x("a", { href: "https://guddesk.com", target: "_blank", rel: "noopener", children: "GudDesk" })
    ] })
  ] });
}
function mo() {
  return /* @__PURE__ */ x(
    "button",
    {
      class: "fc-bubble",
      onClick: () => ee.value = !ee.value,
      "aria-label": ee.value ? "Close chat" : "Open chat",
      dangerouslySetInnerHTML: {
        __html: ee.value ? lo : co
      }
    }
  );
}
const bo = 4e3;
function yo({ appId: n, baseUrl: t, pusherKey: s, pusherCluster: a }) {
  const l = ye(null), u = ye(!1), h = ye(null), p = ye(0), _ = rr(!1);
  function v() {
    y(), l.current = setInterval(() => {
      H.value && ee.value && Je().catch(() => {
      });
    }, bo);
  }
  function y() {
    l.current && (clearInterval(l.current), l.current = null);
  }
  async function d(S, m) {
    if (!u.current) {
      u.current = !0;
      try {
        await io(S, m, `${t}/api/pusher/auth`), H.value && Rt(), so(() => {
          H.value && Je().catch(() => {
          });
        }), y();
      } catch {
        u.current = !1, v();
      }
    }
  }
  return Ae(() => (qs(), Xs(n, t), Vs().catch(() => {
  }).then(() => {
    if (!no(
      window.location.pathname,
      Q.value.pageVisibilityMode,
      Q.value.pageVisibilityPatterns
    )) {
      _.value = !0;
      return;
    }
    H.value && Je().catch(() => {
    });
    const m = s || Q.value.pusherKey, T = a || Q.value.pusherCluster;
    m && T ? d(m, T) : v();
  }), () => {
    oo(), y();
  }), []), Ae(() => {
    H.value && (xt() ? Rt() : l.current || v());
  }, [H.value]), Ae(() => {
    ee.value && H.value && !xt() ? (Je().catch(() => {
    }), v()) : !ee.value && !xt() && y();
  }, [ee.value]), Ae(() => {
    const S = Q.value.offlineFormTimeout;
    if (!S || !H.value) return;
    const m = F.value, T = m.filter((g) => g.type === "VISITOR").length;
    if (m.some((g) => g.type === "AGENT" || g.type === "BOT")) {
      it.value = !1, h.current && (clearTimeout(h.current), h.current = null), p.current = T;
      return;
    }
    return T > p.current && (p.current = T, h.current && clearTimeout(h.current), h.current = setTimeout(() => {
      F.value.some((k) => k.type === "AGENT" || k.type === "BOT") || (it.value = !0);
    }, S * 60 * 1e3)), () => {
      h.current && (clearTimeout(h.current), h.current = null);
    };
  }, [F.value, H.value, Q.value.offlineFormTimeout]), !sr.value || _.value ? null : /* @__PURE__ */ x(le, { children: [
    /* @__PURE__ */ x("style", { children: ao(Q.value.primaryColor, Q.value.position) }),
    /* @__PURE__ */ x("div", { class: "fc-container", children: [
      ee.value && /* @__PURE__ */ x(go, {}),
      /* @__PURE__ */ x(mo, {})
    ] })
  ] });
}
function wo(n) {
  return !n.defaultPrevented || n.ctrlKey || n.metaKey || n.altKey || n.isComposing || n.key.length !== 1 ? null : n.key;
}
function So(n, t) {
  const s = n.selectionStart ?? n.value.length, a = n.selectionEnd ?? s;
  n.value = n.value.slice(0, s) + t + n.value.slice(a);
  const l = s + t.length;
  try {
    n.setSelectionRange(l, l);
  } catch {
  }
  n.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function xo(n) {
  return n instanceof HTMLInputElement || n instanceof HTMLTextAreaElement;
}
const An = ["keydown", "keyup", "keypress"];
function ko(n) {
  const t = (a) => {
    const l = a, u = wo(l);
    !u || !xo(l.target) || So(l.target, u);
  }, s = (a) => {
    a.stopPropagation();
  };
  n.addEventListener("keydown", t, !0);
  for (const a of An)
    n.addEventListener(a, s);
  return () => {
    n.removeEventListener("keydown", t, !0);
    for (const a of An)
      n.removeEventListener(a, s);
  };
}
let we = null, It = null;
const Co = "https://www.guddesk.com";
function lr(n) {
  return n === "cdn.guddesk.com" || n === "www.guddesk.com" || n === "guddesk.com" ? Co : null;
}
function To() {
  const n = document.querySelectorAll("script[src]");
  for (let t = n.length - 1; t >= 0; t--) {
    const s = n[t].src;
    if (s.includes("guddesk") || s.includes("widget"))
      try {
        const a = new URL(s);
        return lr(a.hostname) ?? a.origin;
      } catch {
      }
  }
  return window.location.origin;
}
function Po(n) {
  if (!n) return To();
  try {
    const t = new URL(n);
    return lr(t.hostname) ?? n.replace(/\/$/, "");
  } catch {
    return n.replace(/\/$/, "");
  }
}
function Nt(n) {
  if (we) return;
  const t = n.appId;
  if (!t) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }
  const s = Po(n.baseUrl), a = document.createElement("div");
  a.id = "guddesk-widget", document.body.appendChild(a), we = a.attachShadow({ mode: "open" }), It = ko(we), Fn(
    Dn(yo, {
      appId: t,
      baseUrl: s,
      pusherKey: n.pusherKey,
      pusherCluster: n.pusherCluster
    }),
    we
  );
}
function Eo() {
  const n = document.getElementById("guddesk-widget");
  n && (It?.(), It = null, Fn(null, we), n.remove(), we = null);
}
const Oo = {
  init: Nt,
  identify: (n) => qt(n),
  open: () => {
    ee.value = !0;
  },
  close: () => {
    ee.value = !1;
  },
  destroy: Eo
};
window.GudDesk = Oo;
window.GudDeskSettings && (document.readyState === "loading" ? document.addEventListener(
  "DOMContentLoaded",
  () => Nt(window.GudDeskSettings)
) : Nt(window.GudDeskSettings));
function Ao(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var kt = { exports: {} };
/*!
 * Pusher JavaScript Library v8.4.0
 * https://pusher.com/
 *
 * Copyright 2020, Pusher
 * Released under the MIT licence.
 */
var Ln;
function Lo() {
  return Ln || (Ln = 1, (function(n, t) {
    (function(a, l) {
      n.exports = l();
    })(window, function() {
      return (
        /******/
        (function(s) {
          var a = {};
          function l(u) {
            if (a[u])
              return a[u].exports;
            var h = a[u] = {
              /******/
              i: u,
              /******/
              l: !1,
              /******/
              exports: {}
              /******/
            };
            return s[u].call(h.exports, h, h.exports, l), h.l = !0, h.exports;
          }
          return l.m = s, l.c = a, l.d = function(u, h, p) {
            l.o(u, h) || Object.defineProperty(u, h, { enumerable: !0, get: p });
          }, l.r = function(u) {
            typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(u, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(u, "__esModule", { value: !0 });
          }, l.t = function(u, h) {
            if (h & 1 && (u = l(u)), h & 8 || h & 4 && typeof u == "object" && u && u.__esModule) return u;
            var p = /* @__PURE__ */ Object.create(null);
            if (l.r(p), Object.defineProperty(p, "default", { enumerable: !0, value: u }), h & 2 && typeof u != "string") for (var _ in u) l.d(p, _, function(v) {
              return u[v];
            }.bind(null, _));
            return p;
          }, l.n = function(u) {
            var h = u && u.__esModule ? (
              /******/
              function() {
                return u.default;
              }
            ) : (
              /******/
              function() {
                return u;
              }
            );
            return l.d(h, "a", h), h;
          }, l.o = function(u, h) {
            return Object.prototype.hasOwnProperty.call(u, h);
          }, l.p = "", l(l.s = 2);
        })([
          /* 0 */
          /***/
          (function(s, a, l) {
            var u = this && this.__extends || /* @__PURE__ */ (function() {
              var C = function(g, b) {
                return C = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(k, A) {
                  k.__proto__ = A;
                } || function(k, A) {
                  for (var $ in A) A.hasOwnProperty($) && (k[$] = A[$]);
                }, C(g, b);
              };
              return function(g, b) {
                C(g, b);
                function k() {
                  this.constructor = g;
                }
                g.prototype = b === null ? Object.create(b) : (k.prototype = b.prototype, new k());
              };
            })();
            Object.defineProperty(a, "__esModule", { value: !0 });
            var h = 256, p = (
              /** @class */
              (function() {
                function C(g) {
                  g === void 0 && (g = "="), this._paddingCharacter = g;
                }
                return C.prototype.encodedLength = function(g) {
                  return this._paddingCharacter ? (g + 2) / 3 * 4 | 0 : (g * 8 + 5) / 6 | 0;
                }, C.prototype.encode = function(g) {
                  for (var b = "", k = 0; k < g.length - 2; k += 3) {
                    var A = g[k] << 16 | g[k + 1] << 8 | g[k + 2];
                    b += this._encodeByte(A >>> 18 & 63), b += this._encodeByte(A >>> 12 & 63), b += this._encodeByte(A >>> 6 & 63), b += this._encodeByte(A >>> 0 & 63);
                  }
                  var $ = g.length - k;
                  if ($ > 0) {
                    var A = g[k] << 16 | ($ === 2 ? g[k + 1] << 8 : 0);
                    b += this._encodeByte(A >>> 18 & 63), b += this._encodeByte(A >>> 12 & 63), $ === 2 ? b += this._encodeByte(A >>> 6 & 63) : b += this._paddingCharacter || "", b += this._paddingCharacter || "";
                  }
                  return b;
                }, C.prototype.maxDecodedLength = function(g) {
                  return this._paddingCharacter ? g / 4 * 3 | 0 : (g * 6 + 7) / 8 | 0;
                }, C.prototype.decodedLength = function(g) {
                  return this.maxDecodedLength(g.length - this._getPaddingLength(g));
                }, C.prototype.decode = function(g) {
                  if (g.length === 0)
                    return new Uint8Array(0);
                  for (var b = this._getPaddingLength(g), k = g.length - b, A = new Uint8Array(this.maxDecodedLength(k)), $ = 0, D = 0, G = 0, K = 0, J = 0, j = 0, V = 0; D < k - 4; D += 4)
                    K = this._decodeChar(g.charCodeAt(D + 0)), J = this._decodeChar(g.charCodeAt(D + 1)), j = this._decodeChar(g.charCodeAt(D + 2)), V = this._decodeChar(g.charCodeAt(D + 3)), A[$++] = K << 2 | J >>> 4, A[$++] = J << 4 | j >>> 2, A[$++] = j << 6 | V, G |= K & h, G |= J & h, G |= j & h, G |= V & h;
                  if (D < k - 1 && (K = this._decodeChar(g.charCodeAt(D)), J = this._decodeChar(g.charCodeAt(D + 1)), A[$++] = K << 2 | J >>> 4, G |= K & h, G |= J & h), D < k - 2 && (j = this._decodeChar(g.charCodeAt(D + 2)), A[$++] = J << 4 | j >>> 2, G |= j & h), D < k - 3 && (V = this._decodeChar(g.charCodeAt(D + 3)), A[$++] = j << 6 | V, G |= V & h), G !== 0)
                    throw new Error("Base64Coder: incorrect characters for decoding");
                  return A;
                }, C.prototype._encodeByte = function(g) {
                  var b = g;
                  return b += 65, b += 25 - g >>> 8 & 6, b += 51 - g >>> 8 & -75, b += 61 - g >>> 8 & -15, b += 62 - g >>> 8 & 3, String.fromCharCode(b);
                }, C.prototype._decodeChar = function(g) {
                  var b = h;
                  return b += (42 - g & g - 44) >>> 8 & -h + g - 43 + 62, b += (46 - g & g - 48) >>> 8 & -h + g - 47 + 63, b += (47 - g & g - 58) >>> 8 & -h + g - 48 + 52, b += (64 - g & g - 91) >>> 8 & -h + g - 65 + 0, b += (96 - g & g - 123) >>> 8 & -h + g - 97 + 26, b;
                }, C.prototype._getPaddingLength = function(g) {
                  var b = 0;
                  if (this._paddingCharacter) {
                    for (var k = g.length - 1; k >= 0 && g[k] === this._paddingCharacter; k--)
                      b++;
                    if (g.length < 4 || b > 2)
                      throw new Error("Base64Coder: incorrect padding");
                  }
                  return b;
                }, C;
              })()
            );
            a.Coder = p;
            var _ = new p();
            function v(C) {
              return _.encode(C);
            }
            a.encode = v;
            function y(C) {
              return _.decode(C);
            }
            a.decode = y;
            var d = (
              /** @class */
              (function(C) {
                u(g, C);
                function g() {
                  return C !== null && C.apply(this, arguments) || this;
                }
                return g.prototype._encodeByte = function(b) {
                  var k = b;
                  return k += 65, k += 25 - b >>> 8 & 6, k += 51 - b >>> 8 & -75, k += 61 - b >>> 8 & -13, k += 62 - b >>> 8 & 49, String.fromCharCode(k);
                }, g.prototype._decodeChar = function(b) {
                  var k = h;
                  return k += (44 - b & b - 46) >>> 8 & -h + b - 45 + 62, k += (94 - b & b - 96) >>> 8 & -h + b - 95 + 63, k += (47 - b & b - 58) >>> 8 & -h + b - 48 + 52, k += (64 - b & b - 91) >>> 8 & -h + b - 65 + 0, k += (96 - b & b - 123) >>> 8 & -h + b - 97 + 26, k;
                }, g;
              })(p)
            );
            a.URLSafeCoder = d;
            var S = new d();
            function m(C) {
              return S.encode(C);
            }
            a.encodeURLSafe = m;
            function T(C) {
              return S.decode(C);
            }
            a.decodeURLSafe = T, a.encodedLength = function(C) {
              return _.encodedLength(C);
            }, a.maxDecodedLength = function(C) {
              return _.maxDecodedLength(C);
            }, a.decodedLength = function(C) {
              return _.decodedLength(C);
            };
          }),
          /* 1 */
          /***/
          (function(s, a, l) {
            Object.defineProperty(a, "__esModule", { value: !0 });
            var u = "utf8: invalid string", h = "utf8: invalid source encoding";
            function p(y) {
              for (var d = new Uint8Array(_(y)), S = 0, m = 0; m < y.length; m++) {
                var T = y.charCodeAt(m);
                T < 128 ? d[S++] = T : T < 2048 ? (d[S++] = 192 | T >> 6, d[S++] = 128 | T & 63) : T < 55296 ? (d[S++] = 224 | T >> 12, d[S++] = 128 | T >> 6 & 63, d[S++] = 128 | T & 63) : (m++, T = (T & 1023) << 10, T |= y.charCodeAt(m) & 1023, T += 65536, d[S++] = 240 | T >> 18, d[S++] = 128 | T >> 12 & 63, d[S++] = 128 | T >> 6 & 63, d[S++] = 128 | T & 63);
              }
              return d;
            }
            a.encode = p;
            function _(y) {
              for (var d = 0, S = 0; S < y.length; S++) {
                var m = y.charCodeAt(S);
                if (m < 128)
                  d += 1;
                else if (m < 2048)
                  d += 2;
                else if (m < 55296)
                  d += 3;
                else if (m <= 57343) {
                  if (S >= y.length - 1)
                    throw new Error(u);
                  S++, d += 4;
                } else
                  throw new Error(u);
              }
              return d;
            }
            a.encodedLength = _;
            function v(y) {
              for (var d = [], S = 0; S < y.length; S++) {
                var m = y[S];
                if (m & 128) {
                  var T = void 0;
                  if (m < 224) {
                    if (S >= y.length)
                      throw new Error(h);
                    var C = y[++S];
                    if ((C & 192) !== 128)
                      throw new Error(h);
                    m = (m & 31) << 6 | C & 63, T = 128;
                  } else if (m < 240) {
                    if (S >= y.length - 1)
                      throw new Error(h);
                    var C = y[++S], g = y[++S];
                    if ((C & 192) !== 128 || (g & 192) !== 128)
                      throw new Error(h);
                    m = (m & 15) << 12 | (C & 63) << 6 | g & 63, T = 2048;
                  } else if (m < 248) {
                    if (S >= y.length - 2)
                      throw new Error(h);
                    var C = y[++S], g = y[++S], b = y[++S];
                    if ((C & 192) !== 128 || (g & 192) !== 128 || (b & 192) !== 128)
                      throw new Error(h);
                    m = (m & 15) << 18 | (C & 63) << 12 | (g & 63) << 6 | b & 63, T = 65536;
                  } else
                    throw new Error(h);
                  if (m < T || m >= 55296 && m <= 57343)
                    throw new Error(h);
                  if (m >= 65536) {
                    if (m > 1114111)
                      throw new Error(h);
                    m -= 65536, d.push(String.fromCharCode(55296 | m >> 10)), m = 56320 | m & 1023;
                  }
                }
                d.push(String.fromCharCode(m));
              }
              return d.join("");
            }
            a.decode = v;
          }),
          /* 2 */
          /***/
          (function(s, a, l) {
            s.exports = l(3).default;
          }),
          /* 3 */
          /***/
          (function(s, a, l) {
            l.r(a);
            class u {
              constructor(e, r) {
                this.lastId = 0, this.prefix = e, this.name = r;
              }
              create(e) {
                this.lastId++;
                var r = this.lastId, o = this.prefix + r, c = this.name + "[" + r + "]", f = !1, w = function() {
                  f || (e.apply(null, arguments), f = !0);
                };
                return this[r] = w, { number: r, id: o, name: c, callback: w };
              }
              remove(e) {
                delete this[e.number];
              }
            }
            var h = new u("_pusher_script_", "Pusher.ScriptReceivers"), p = {
              VERSION: "8.4.0",
              PROTOCOL: 7,
              wsPort: 80,
              wssPort: 443,
              wsPath: "",
              httpHost: "sockjs.pusher.com",
              httpPort: 80,
              httpsPort: 443,
              httpPath: "/pusher",
              stats_host: "stats.pusher.com",
              authEndpoint: "/pusher/auth",
              authTransport: "ajax",
              activityTimeout: 12e4,
              pongTimeout: 3e4,
              unavailableTimeout: 1e4,
              userAuthentication: {
                endpoint: "/pusher/user-auth",
                transport: "ajax"
              },
              channelAuthorization: {
                endpoint: "/pusher/auth",
                transport: "ajax"
              },
              cdn_http: "http://js.pusher.com",
              cdn_https: "https://js.pusher.com",
              dependency_suffix: ""
            }, _ = p;
            class v {
              constructor(e) {
                this.options = e, this.receivers = e.receivers || h, this.loading = {};
              }
              load(e, r, o) {
                var c = this;
                if (c.loading[e] && c.loading[e].length > 0)
                  c.loading[e].push(o);
                else {
                  c.loading[e] = [o];
                  var f = O.createScriptRequest(c.getPath(e, r)), w = c.receivers.create(function(P) {
                    if (c.receivers.remove(w), c.loading[e]) {
                      var E = c.loading[e];
                      delete c.loading[e];
                      for (var L = function(z) {
                        z || f.cleanup();
                      }, N = 0; N < E.length; N++)
                        E[N](P, L);
                    }
                  });
                  f.send(w);
                }
              }
              getRoot(e) {
                var r, o = O.getDocument().location.protocol;
                return e && e.useTLS || o === "https:" ? r = this.options.cdn_https : r = this.options.cdn_http, r.replace(/\/*$/, "") + "/" + this.options.version;
              }
              getPath(e, r) {
                return this.getRoot(r) + "/" + e + this.options.suffix + ".js";
              }
            }
            var y = new u("_pusher_dependencies", "Pusher.DependenciesReceivers"), d = new v({
              cdn_http: _.cdn_http,
              cdn_https: _.cdn_https,
              version: _.VERSION,
              suffix: _.dependency_suffix,
              receivers: y
            });
            const S = {
              baseUrl: "https://pusher.com",
              urls: {
                authenticationEndpoint: {
                  path: "/docs/channels/server_api/authenticating_users"
                },
                authorizationEndpoint: {
                  path: "/docs/channels/server_api/authorizing-users/"
                },
                javascriptQuickStart: {
                  path: "/docs/javascript_quick_start"
                },
                triggeringClientEvents: {
                  path: "/docs/client_api_guide/client_events#trigger-events"
                },
                encryptedChannelSupport: {
                  fullUrl: "https://github.com/pusher/pusher-js/tree/cc491015371a4bde5743d1c87a0fbac0feb53195#encrypted-channel-support"
                }
              }
            };
            var T = { buildLogSuffix: function(i) {
              const e = "See:", r = S.urls[i];
              if (!r)
                return "";
              let o;
              return r.fullUrl ? o = r.fullUrl : r.path && (o = S.baseUrl + r.path), o ? `${e} ${o}` : "";
            } }, C;
            (function(i) {
              i.UserAuthentication = "user-authentication", i.ChannelAuthorization = "channel-authorization";
            })(C || (C = {}));
            class g extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class b extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class k extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class A extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class $ extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class D extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class G extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class K extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class J extends Error {
              constructor(e, r) {
                super(r), this.status = e, Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            var V = function(i, e, r, o, c) {
              const f = O.createXHR();
              f.open("POST", r.endpoint, !0), f.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
              for (var w in r.headers)
                f.setRequestHeader(w, r.headers[w]);
              if (r.headersProvider != null) {
                let P = r.headersProvider();
                for (var w in P)
                  f.setRequestHeader(w, P[w]);
              }
              return f.onreadystatechange = function() {
                if (f.readyState === 4)
                  if (f.status === 200) {
                    let P, E = !1;
                    try {
                      P = JSON.parse(f.responseText), E = !0;
                    } catch {
                      c(new J(200, `JSON returned from ${o.toString()} endpoint was invalid, yet status code was 200. Data was: ${f.responseText}`), null);
                    }
                    E && c(null, P);
                  } else {
                    let P = "";
                    switch (o) {
                      case C.UserAuthentication:
                        P = T.buildLogSuffix("authenticationEndpoint");
                        break;
                      case C.ChannelAuthorization:
                        P = `Clients must be authorized to join private or presence channels. ${T.buildLogSuffix("authorizationEndpoint")}`;
                        break;
                    }
                    c(new J(f.status, `Unable to retrieve auth string from ${o.toString()} endpoint - received status: ${f.status} from ${r.endpoint}. ${P}`), null);
                  }
              }, f.send(e), f;
            };
            function dr(i) {
              return vr(pr(i));
            }
            var Ce = String.fromCharCode, He = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", fr = function(i) {
              var e = i.charCodeAt(0);
              return e < 128 ? i : e < 2048 ? Ce(192 | e >>> 6) + Ce(128 | e & 63) : Ce(224 | e >>> 12 & 15) + Ce(128 | e >>> 6 & 63) + Ce(128 | e & 63);
            }, pr = function(i) {
              return i.replace(/[^\x00-\x7F]/g, fr);
            }, _r = function(i) {
              var e = [0, 2, 1][i.length % 3], r = i.charCodeAt(0) << 16 | (i.length > 1 ? i.charCodeAt(1) : 0) << 8 | (i.length > 2 ? i.charCodeAt(2) : 0), o = [
                He.charAt(r >>> 18),
                He.charAt(r >>> 12 & 63),
                e >= 2 ? "=" : He.charAt(r >>> 6 & 63),
                e >= 1 ? "=" : He.charAt(r & 63)
              ];
              return o.join("");
            }, vr = window.btoa || function(i) {
              return i.replace(/[\s\S]{1,3}/g, _r);
            };
            class gr {
              constructor(e, r, o, c) {
                this.clear = r, this.timer = e(() => {
                  this.timer && (this.timer = c(this.timer));
                }, o);
              }
              isRunning() {
                return this.timer !== null;
              }
              ensureAborted() {
                this.timer && (this.clear(this.timer), this.timer = null);
              }
            }
            var Bt = gr;
            function mr(i) {
              window.clearTimeout(i);
            }
            function br(i) {
              window.clearInterval(i);
            }
            class de extends Bt {
              constructor(e, r) {
                super(setTimeout, mr, e, function(o) {
                  return r(), null;
                });
              }
            }
            class yr extends Bt {
              constructor(e, r) {
                super(setInterval, br, e, function(o) {
                  return r(), o;
                });
              }
            }
            var wr = {
              now() {
                return Date.now ? Date.now() : (/* @__PURE__ */ new Date()).valueOf();
              },
              defer(i) {
                return new de(0, i);
              },
              method(i, ...e) {
                var r = Array.prototype.slice.call(arguments, 1);
                return function(o) {
                  return o[i].apply(o, r.concat(arguments));
                };
              }
            }, X = wr;
            function Y(i, ...e) {
              for (var r = 0; r < e.length; r++) {
                var o = e[r];
                for (var c in o)
                  o[c] && o[c].constructor && o[c].constructor === Object ? i[c] = Y(i[c] || {}, o[c]) : i[c] = o[c];
              }
              return i;
            }
            function Sr() {
              for (var i = ["Pusher"], e = 0; e < arguments.length; e++)
                typeof arguments[e] == "string" ? i.push(arguments[e]) : i.push(Me(arguments[e]));
              return i.join(" : ");
            }
            function Ft(i, e) {
              var r = Array.prototype.indexOf;
              if (i === null)
                return -1;
              if (r && i.indexOf === r)
                return i.indexOf(e);
              for (var o = 0, c = i.length; o < c; o++)
                if (i[o] === e)
                  return o;
              return -1;
            }
            function ie(i, e) {
              for (var r in i)
                Object.prototype.hasOwnProperty.call(i, r) && e(i[r], r, i);
            }
            function Wt(i) {
              var e = [];
              return ie(i, function(r, o) {
                e.push(o);
              }), e;
            }
            function xr(i) {
              var e = [];
              return ie(i, function(r) {
                e.push(r);
              }), e;
            }
            function Te(i, e, r) {
              for (var o = 0; o < i.length; o++)
                e.call(r || window, i[o], o, i);
            }
            function Jt(i, e) {
              for (var r = [], o = 0; o < i.length; o++)
                r.push(e(i[o], o, i, r));
              return r;
            }
            function kr(i, e) {
              var r = {};
              return ie(i, function(o, c) {
                r[c] = e(o);
              }), r;
            }
            function Xt(i, e) {
              e = e || function(c) {
                return !!c;
              };
              for (var r = [], o = 0; o < i.length; o++)
                e(i[o], o, i, r) && r.push(i[o]);
              return r;
            }
            function Vt(i, e) {
              var r = {};
              return ie(i, function(o, c) {
                (e && e(o, c, i, r) || o) && (r[c] = o);
              }), r;
            }
            function Cr(i) {
              var e = [];
              return ie(i, function(r, o) {
                e.push([o, r]);
              }), e;
            }
            function Gt(i, e) {
              for (var r = 0; r < i.length; r++)
                if (e(i[r], r, i))
                  return !0;
              return !1;
            }
            function Tr(i, e) {
              for (var r = 0; r < i.length; r++)
                if (!e(i[r], r, i))
                  return !1;
              return !0;
            }
            function Pr(i) {
              return kr(i, function(e) {
                return typeof e == "object" && (e = Me(e)), encodeURIComponent(dr(e.toString()));
              });
            }
            function Er(i) {
              var e = Vt(i, function(o) {
                return o !== void 0;
              }), r = Jt(Cr(Pr(e)), X.method("join", "=")).join("&");
              return r;
            }
            function Or(i) {
              var e = [], r = [];
              return (function o(c, f) {
                var w, P, E;
                switch (typeof c) {
                  case "object":
                    if (!c)
                      return null;
                    for (w = 0; w < e.length; w += 1)
                      if (e[w] === c)
                        return { $ref: r[w] };
                    if (e.push(c), r.push(f), Object.prototype.toString.apply(c) === "[object Array]")
                      for (E = [], w = 0; w < c.length; w += 1)
                        E[w] = o(c[w], f + "[" + w + "]");
                    else {
                      E = {};
                      for (P in c)
                        Object.prototype.hasOwnProperty.call(c, P) && (E[P] = o(c[P], f + "[" + JSON.stringify(P) + "]"));
                    }
                    return E;
                  case "number":
                  case "string":
                  case "boolean":
                    return c;
                }
              })(i, "$");
            }
            function Me(i) {
              try {
                return JSON.stringify(i);
              } catch {
                return JSON.stringify(Or(i));
              }
            }
            class Ar {
              constructor() {
                this.globalLog = (e) => {
                  window.console && window.console.log && window.console.log(e);
                };
              }
              debug(...e) {
                this.log(this.globalLog, e);
              }
              warn(...e) {
                this.log(this.globalLogWarn, e);
              }
              error(...e) {
                this.log(this.globalLogError, e);
              }
              globalLogWarn(e) {
                window.console && window.console.warn ? window.console.warn(e) : this.globalLog(e);
              }
              globalLogError(e) {
                window.console && window.console.error ? window.console.error(e) : this.globalLogWarn(e);
              }
              log(e, ...r) {
                var o = Sr.apply(this, arguments);
                bt.log ? bt.log(o) : bt.logToConsole && e.bind(this)(o);
              }
            }
            var U = new Ar(), Lr = function(i, e, r, o, c) {
              (r.headers !== void 0 || r.headersProvider != null) && U.warn(`To send headers with the ${o.toString()} request, you must use AJAX, rather than JSONP.`);
              var f = i.nextAuthCallbackID.toString();
              i.nextAuthCallbackID++;
              var w = i.getDocument(), P = w.createElement("script");
              i.auth_callbacks[f] = function(N) {
                c(null, N);
              };
              var E = "Pusher.auth_callbacks['" + f + "']";
              P.src = r.endpoint + "?callback=" + encodeURIComponent(E) + "&" + e;
              var L = w.getElementsByTagName("head")[0] || w.documentElement;
              L.insertBefore(P, L.firstChild);
            }, Rr = Lr;
            class Ir {
              constructor(e) {
                this.src = e;
              }
              send(e) {
                var r = this, o = "Error loading " + r.src;
                r.script = document.createElement("script"), r.script.id = e.id, r.script.src = r.src, r.script.type = "text/javascript", r.script.charset = "UTF-8", r.script.addEventListener ? (r.script.onerror = function() {
                  e.callback(o);
                }, r.script.onload = function() {
                  e.callback(null);
                }) : r.script.onreadystatechange = function() {
                  (r.script.readyState === "loaded" || r.script.readyState === "complete") && e.callback(null);
                }, r.script.async === void 0 && document.attachEvent && /opera/i.test(navigator.userAgent) ? (r.errorScript = document.createElement("script"), r.errorScript.id = e.id + "_error", r.errorScript.text = e.name + "('" + o + "');", r.script.async = r.errorScript.async = !1) : r.script.async = !0;
                var c = document.getElementsByTagName("head")[0];
                c.insertBefore(r.script, c.firstChild), r.errorScript && c.insertBefore(r.errorScript, r.script.nextSibling);
              }
              cleanup() {
                this.script && (this.script.onload = this.script.onerror = null, this.script.onreadystatechange = null), this.script && this.script.parentNode && this.script.parentNode.removeChild(this.script), this.errorScript && this.errorScript.parentNode && this.errorScript.parentNode.removeChild(this.errorScript), this.script = null, this.errorScript = null;
              }
            }
            class Nr {
              constructor(e, r) {
                this.url = e, this.data = r;
              }
              send(e) {
                if (!this.request) {
                  var r = Er(this.data), o = this.url + "/" + e.number + "?" + r;
                  this.request = O.createScriptRequest(o), this.request.send(e);
                }
              }
              cleanup() {
                this.request && this.request.cleanup();
              }
            }
            var $r = function(i, e) {
              return function(r, o) {
                var c = "http" + (e ? "s" : "") + "://", f = c + (i.host || i.options.host) + i.options.path, w = O.createJSONPRequest(f, r), P = O.ScriptReceivers.create(function(E, L) {
                  h.remove(P), w.cleanup(), L && L.host && (i.host = L.host), o && o(E, L);
                });
                w.send(P);
              };
            }, Ur = {
              name: "jsonp",
              getAgent: $r
            }, Dr = Ur;
            function ut(i, e, r) {
              var o = i + (e.useTLS ? "s" : ""), c = e.useTLS ? e.hostTLS : e.hostNonTLS;
              return o + "://" + c + r;
            }
            function lt(i, e) {
              var r = "/app/" + i, o = "?protocol=" + _.PROTOCOL + "&client=js&version=" + _.VERSION + (e ? "&" + e : "");
              return r + o;
            }
            var Hr = {
              getInitial: function(i, e) {
                var r = (e.httpPath || "") + lt(i, "flash=false");
                return ut("ws", e, r);
              }
            }, Mr = {
              getInitial: function(i, e) {
                var r = (e.httpPath || "/pusher") + lt(i);
                return ut("http", e, r);
              }
            }, jr = {
              getInitial: function(i, e) {
                return ut("http", e, e.httpPath || "/pusher");
              },
              getPath: function(i, e) {
                return lt(i);
              }
            };
            class zr {
              constructor() {
                this._callbacks = {};
              }
              get(e) {
                return this._callbacks[ht(e)];
              }
              add(e, r, o) {
                var c = ht(e);
                this._callbacks[c] = this._callbacks[c] || [], this._callbacks[c].push({
                  fn: r,
                  context: o
                });
              }
              remove(e, r, o) {
                if (!e && !r && !o) {
                  this._callbacks = {};
                  return;
                }
                var c = e ? [ht(e)] : Wt(this._callbacks);
                r || o ? this.removeCallback(c, r, o) : this.removeAllCallbacks(c);
              }
              removeCallback(e, r, o) {
                Te(e, function(c) {
                  this._callbacks[c] = Xt(this._callbacks[c] || [], function(f) {
                    return r && r !== f.fn || o && o !== f.context;
                  }), this._callbacks[c].length === 0 && delete this._callbacks[c];
                }, this);
              }
              removeAllCallbacks(e) {
                Te(e, function(r) {
                  delete this._callbacks[r];
                }, this);
              }
            }
            function ht(i) {
              return "_" + i;
            }
            class se {
              constructor(e) {
                this.callbacks = new zr(), this.global_callbacks = [], this.failThrough = e;
              }
              bind(e, r, o) {
                return this.callbacks.add(e, r, o), this;
              }
              bind_global(e) {
                return this.global_callbacks.push(e), this;
              }
              unbind(e, r, o) {
                return this.callbacks.remove(e, r, o), this;
              }
              unbind_global(e) {
                return e ? (this.global_callbacks = Xt(this.global_callbacks || [], (r) => r !== e), this) : (this.global_callbacks = [], this);
              }
              unbind_all() {
                return this.unbind(), this.unbind_global(), this;
              }
              emit(e, r, o) {
                for (var c = 0; c < this.global_callbacks.length; c++)
                  this.global_callbacks[c](e, r);
                var f = this.callbacks.get(e), w = [];
                if (o ? w.push(r, o) : r && w.push(r), f && f.length > 0)
                  for (var c = 0; c < f.length; c++)
                    f[c].fn.apply(f[c].context || window, w);
                else this.failThrough && this.failThrough(e, r);
                return this;
              }
            }
            class qr extends se {
              constructor(e, r, o, c, f) {
                super(), this.initialize = O.transportConnectionInitializer, this.hooks = e, this.name = r, this.priority = o, this.key = c, this.options = f, this.state = "new", this.timeline = f.timeline, this.activityTimeout = f.activityTimeout, this.id = this.timeline.generateUniqueID();
              }
              handlesActivityChecks() {
                return !!this.hooks.handlesActivityChecks;
              }
              supportsPing() {
                return !!this.hooks.supportsPing;
              }
              connect() {
                if (this.socket || this.state !== "initialized")
                  return !1;
                var e = this.hooks.urls.getInitial(this.key, this.options);
                try {
                  this.socket = this.hooks.getSocket(e, this.options);
                } catch (r) {
                  return X.defer(() => {
                    this.onError(r), this.changeState("closed");
                  }), !1;
                }
                return this.bindListeners(), U.debug("Connecting", { transport: this.name, url: e }), this.changeState("connecting"), !0;
              }
              close() {
                return this.socket ? (this.socket.close(), !0) : !1;
              }
              send(e) {
                return this.state === "open" ? (X.defer(() => {
                  this.socket && this.socket.send(e);
                }), !0) : !1;
              }
              ping() {
                this.state === "open" && this.supportsPing() && this.socket.ping();
              }
              onOpen() {
                this.hooks.beforeOpen && this.hooks.beforeOpen(this.socket, this.hooks.urls.getPath(this.key, this.options)), this.changeState("open"), this.socket.onopen = void 0;
              }
              onError(e) {
                this.emit("error", { type: "WebSocketError", error: e }), this.timeline.error(this.buildTimelineMessage({ error: e.toString() }));
              }
              onClose(e) {
                e ? this.changeState("closed", {
                  code: e.code,
                  reason: e.reason,
                  wasClean: e.wasClean
                }) : this.changeState("closed"), this.unbindListeners(), this.socket = void 0;
              }
              onMessage(e) {
                this.emit("message", e);
              }
              onActivity() {
                this.emit("activity");
              }
              bindListeners() {
                this.socket.onopen = () => {
                  this.onOpen();
                }, this.socket.onerror = (e) => {
                  this.onError(e);
                }, this.socket.onclose = (e) => {
                  this.onClose(e);
                }, this.socket.onmessage = (e) => {
                  this.onMessage(e);
                }, this.supportsPing() && (this.socket.onactivity = () => {
                  this.onActivity();
                });
              }
              unbindListeners() {
                this.socket && (this.socket.onopen = void 0, this.socket.onerror = void 0, this.socket.onclose = void 0, this.socket.onmessage = void 0, this.supportsPing() && (this.socket.onactivity = void 0));
              }
              changeState(e, r) {
                this.state = e, this.timeline.info(this.buildTimelineMessage({
                  state: e,
                  params: r
                })), this.emit(e, r);
              }
              buildTimelineMessage(e) {
                return Y({ cid: this.id }, e);
              }
            }
            class me {
              constructor(e) {
                this.hooks = e;
              }
              isSupported(e) {
                return this.hooks.isSupported(e);
              }
              createConnection(e, r, o, c) {
                return new qr(this.hooks, e, r, o, c);
              }
            }
            var Br = new me({
              urls: Hr,
              handlesActivityChecks: !1,
              supportsPing: !1,
              isInitialized: function() {
                return !!O.getWebSocketAPI();
              },
              isSupported: function() {
                return !!O.getWebSocketAPI();
              },
              getSocket: function(i) {
                return O.createWebSocket(i);
              }
            }), Kt = {
              urls: Mr,
              handlesActivityChecks: !1,
              supportsPing: !0,
              isInitialized: function() {
                return !0;
              }
            }, Yt = Y({
              getSocket: function(i) {
                return O.HTTPFactory.createStreamingSocket(i);
              }
            }, Kt), Qt = Y({
              getSocket: function(i) {
                return O.HTTPFactory.createPollingSocket(i);
              }
            }, Kt), Zt = {
              isSupported: function() {
                return O.isXHRSupported();
              }
            }, Fr = new me(Y({}, Yt, Zt)), Wr = new me(Y({}, Qt, Zt)), Jr = {
              ws: Br,
              xhr_streaming: Fr,
              xhr_polling: Wr
            }, je = Jr, Xr = new me({
              file: "sockjs",
              urls: jr,
              handlesActivityChecks: !0,
              supportsPing: !1,
              isSupported: function() {
                return !0;
              },
              isInitialized: function() {
                return window.SockJS !== void 0;
              },
              getSocket: function(i, e) {
                return new window.SockJS(i, null, {
                  js_path: d.getPath("sockjs", {
                    useTLS: e.useTLS
                  }),
                  ignore_null_origin: e.ignoreNullOrigin
                });
              },
              beforeOpen: function(i, e) {
                i.send(JSON.stringify({
                  path: e
                }));
              }
            }), en = {
              isSupported: function(i) {
                var e = O.isXDRSupported(i.useTLS);
                return e;
              }
            }, Vr = new me(Y({}, Yt, en)), Gr = new me(Y({}, Qt, en));
            je.xdr_streaming = Vr, je.xdr_polling = Gr, je.sockjs = Xr;
            var Kr = je;
            class Yr extends se {
              constructor() {
                super();
                var e = this;
                window.addEventListener !== void 0 && (window.addEventListener("online", function() {
                  e.emit("online");
                }, !1), window.addEventListener("offline", function() {
                  e.emit("offline");
                }, !1));
              }
              isOnline() {
                return window.navigator.onLine === void 0 ? !0 : window.navigator.onLine;
              }
            }
            var Qr = new Yr();
            class Zr {
              constructor(e, r, o) {
                this.manager = e, this.transport = r, this.minPingDelay = o.minPingDelay, this.maxPingDelay = o.maxPingDelay, this.pingDelay = void 0;
              }
              createConnection(e, r, o, c) {
                c = Y({}, c, {
                  activityTimeout: this.pingDelay
                });
                var f = this.transport.createConnection(e, r, o, c), w = null, P = function() {
                  f.unbind("open", P), f.bind("closed", E), w = X.now();
                }, E = (L) => {
                  if (f.unbind("closed", E), L.code === 1002 || L.code === 1003)
                    this.manager.reportDeath();
                  else if (!L.wasClean && w) {
                    var N = X.now() - w;
                    N < 2 * this.maxPingDelay && (this.manager.reportDeath(), this.pingDelay = Math.max(N / 2, this.minPingDelay));
                  }
                };
                return f.bind("open", P), f;
              }
              isSupported(e) {
                return this.manager.isAlive() && this.transport.isSupported(e);
              }
            }
            const tn = {
              decodeMessage: function(i) {
                try {
                  var e = JSON.parse(i.data), r = e.data;
                  if (typeof r == "string")
                    try {
                      r = JSON.parse(e.data);
                    } catch {
                    }
                  var o = {
                    event: e.event,
                    channel: e.channel,
                    data: r
                  };
                  return e.user_id && (o.user_id = e.user_id), o;
                } catch (c) {
                  throw { type: "MessageParseError", error: c, data: i.data };
                }
              },
              encodeMessage: function(i) {
                return JSON.stringify(i);
              },
              processHandshake: function(i) {
                var e = tn.decodeMessage(i);
                if (e.event === "pusher:connection_established") {
                  if (!e.data.activity_timeout)
                    throw "No activity timeout specified in handshake";
                  return {
                    action: "connected",
                    id: e.data.socket_id,
                    activityTimeout: e.data.activity_timeout * 1e3
                  };
                } else {
                  if (e.event === "pusher:error")
                    return {
                      action: this.getCloseAction(e.data),
                      error: this.getCloseError(e.data)
                    };
                  throw "Invalid handshake";
                }
              },
              getCloseAction: function(i) {
                return i.code < 4e3 ? i.code >= 1002 && i.code <= 1004 ? "backoff" : null : i.code === 4e3 ? "tls_only" : i.code < 4100 ? "refused" : i.code < 4200 ? "backoff" : i.code < 4300 ? "retry" : "refused";
              },
              getCloseError: function(i) {
                return i.code !== 1e3 && i.code !== 1001 ? {
                  type: "PusherError",
                  data: {
                    code: i.code,
                    message: i.reason || i.message
                  }
                } : null;
              }
            };
            var fe = tn;
            class ei extends se {
              constructor(e, r) {
                super(), this.id = e, this.transport = r, this.activityTimeout = r.activityTimeout, this.bindListeners();
              }
              handlesActivityChecks() {
                return this.transport.handlesActivityChecks();
              }
              send(e) {
                return this.transport.send(e);
              }
              send_event(e, r, o) {
                var c = { event: e, data: r };
                return o && (c.channel = o), U.debug("Event sent", c), this.send(fe.encodeMessage(c));
              }
              ping() {
                this.transport.supportsPing() ? this.transport.ping() : this.send_event("pusher:ping", {});
              }
              close() {
                this.transport.close();
              }
              bindListeners() {
                var e = {
                  message: (o) => {
                    var c;
                    try {
                      c = fe.decodeMessage(o);
                    } catch (f) {
                      this.emit("error", {
                        type: "MessageParseError",
                        error: f,
                        data: o.data
                      });
                    }
                    if (c !== void 0) {
                      switch (U.debug("Event recd", c), c.event) {
                        case "pusher:error":
                          this.emit("error", {
                            type: "PusherError",
                            data: c.data
                          });
                          break;
                        case "pusher:ping":
                          this.emit("ping");
                          break;
                        case "pusher:pong":
                          this.emit("pong");
                          break;
                      }
                      this.emit("message", c);
                    }
                  },
                  activity: () => {
                    this.emit("activity");
                  },
                  error: (o) => {
                    this.emit("error", o);
                  },
                  closed: (o) => {
                    r(), o && o.code && this.handleCloseEvent(o), this.transport = null, this.emit("closed");
                  }
                }, r = () => {
                  ie(e, (o, c) => {
                    this.transport.unbind(c, o);
                  });
                };
                ie(e, (o, c) => {
                  this.transport.bind(c, o);
                });
              }
              handleCloseEvent(e) {
                var r = fe.getCloseAction(e), o = fe.getCloseError(e);
                o && this.emit("error", o), r && this.emit(r, { action: r, error: o });
              }
            }
            class ti {
              constructor(e, r) {
                this.transport = e, this.callback = r, this.bindListeners();
              }
              close() {
                this.unbindListeners(), this.transport.close();
              }
              bindListeners() {
                this.onMessage = (e) => {
                  this.unbindListeners();
                  var r;
                  try {
                    r = fe.processHandshake(e);
                  } catch (o) {
                    this.finish("error", { error: o }), this.transport.close();
                    return;
                  }
                  r.action === "connected" ? this.finish("connected", {
                    connection: new ei(r.id, this.transport),
                    activityTimeout: r.activityTimeout
                  }) : (this.finish(r.action, { error: r.error }), this.transport.close());
                }, this.onClosed = (e) => {
                  this.unbindListeners();
                  var r = fe.getCloseAction(e) || "backoff", o = fe.getCloseError(e);
                  this.finish(r, { error: o });
                }, this.transport.bind("message", this.onMessage), this.transport.bind("closed", this.onClosed);
              }
              unbindListeners() {
                this.transport.unbind("message", this.onMessage), this.transport.unbind("closed", this.onClosed);
              }
              finish(e, r) {
                this.callback(Y({ transport: this.transport, action: e }, r));
              }
            }
            class ni {
              constructor(e, r) {
                this.timeline = e, this.options = r || {};
              }
              send(e, r) {
                this.timeline.isEmpty() || this.timeline.send(O.TimelineTransport.getAgent(this, e), r);
              }
            }
            class dt extends se {
              constructor(e, r) {
                super(function(o, c) {
                  U.debug("No callbacks on " + e + " for " + o);
                }), this.name = e, this.pusher = r, this.subscribed = !1, this.subscriptionPending = !1, this.subscriptionCancelled = !1;
              }
              authorize(e, r) {
                return r(null, { auth: "" });
              }
              trigger(e, r) {
                if (e.indexOf("client-") !== 0)
                  throw new g("Event '" + e + "' does not start with 'client-'");
                if (!this.subscribed) {
                  var o = T.buildLogSuffix("triggeringClientEvents");
                  U.warn(`Client event triggered before channel 'subscription_succeeded' event . ${o}`);
                }
                return this.pusher.send_event(e, r, this.name);
              }
              disconnect() {
                this.subscribed = !1, this.subscriptionPending = !1;
              }
              handleEvent(e) {
                var r = e.event, o = e.data;
                if (r === "pusher_internal:subscription_succeeded")
                  this.handleSubscriptionSucceededEvent(e);
                else if (r === "pusher_internal:subscription_count")
                  this.handleSubscriptionCountEvent(e);
                else if (r.indexOf("pusher_internal:") !== 0) {
                  var c = {};
                  this.emit(r, o, c);
                }
              }
              handleSubscriptionSucceededEvent(e) {
                this.subscriptionPending = !1, this.subscribed = !0, this.subscriptionCancelled ? this.pusher.unsubscribe(this.name) : this.emit("pusher:subscription_succeeded", e.data);
              }
              handleSubscriptionCountEvent(e) {
                e.data.subscription_count && (this.subscriptionCount = e.data.subscription_count), this.emit("pusher:subscription_count", e.data);
              }
              subscribe() {
                this.subscribed || (this.subscriptionPending = !0, this.subscriptionCancelled = !1, this.authorize(this.pusher.connection.socket_id, (e, r) => {
                  e ? (this.subscriptionPending = !1, U.error(e.toString()), this.emit("pusher:subscription_error", Object.assign({}, {
                    type: "AuthError",
                    error: e.message
                  }, e instanceof J ? { status: e.status } : {}))) : this.pusher.send_event("pusher:subscribe", {
                    auth: r.auth,
                    channel_data: r.channel_data,
                    channel: this.name
                  });
                }));
              }
              unsubscribe() {
                this.subscribed = !1, this.pusher.send_event("pusher:unsubscribe", {
                  channel: this.name
                });
              }
              cancelSubscription() {
                this.subscriptionCancelled = !0;
              }
              reinstateSubscription() {
                this.subscriptionCancelled = !1;
              }
            }
            class ft extends dt {
              authorize(e, r) {
                return this.pusher.config.channelAuthorizer({
                  channelName: this.name,
                  socketId: e
                }, r);
              }
            }
            class ri {
              constructor() {
                this.reset();
              }
              get(e) {
                return Object.prototype.hasOwnProperty.call(this.members, e) ? {
                  id: e,
                  info: this.members[e]
                } : null;
              }
              each(e) {
                ie(this.members, (r, o) => {
                  e(this.get(o));
                });
              }
              setMyID(e) {
                this.myID = e;
              }
              onSubscription(e) {
                this.members = e.presence.hash, this.count = e.presence.count, this.me = this.get(this.myID);
              }
              addMember(e) {
                return this.get(e.user_id) === null && this.count++, this.members[e.user_id] = e.user_info, this.get(e.user_id);
              }
              removeMember(e) {
                var r = this.get(e.user_id);
                return r && (delete this.members[e.user_id], this.count--), r;
              }
              reset() {
                this.members = {}, this.count = 0, this.myID = null, this.me = null;
              }
            }
            var ii = function(i, e, r, o) {
              function c(f) {
                return f instanceof r ? f : new r(function(w) {
                  w(f);
                });
              }
              return new (r || (r = Promise))(function(f, w) {
                function P(N) {
                  try {
                    L(o.next(N));
                  } catch (z) {
                    w(z);
                  }
                }
                function E(N) {
                  try {
                    L(o.throw(N));
                  } catch (z) {
                    w(z);
                  }
                }
                function L(N) {
                  N.done ? f(N.value) : c(N.value).then(P, E);
                }
                L((o = o.apply(i, e || [])).next());
              });
            };
            class si extends ft {
              constructor(e, r) {
                super(e, r), this.members = new ri();
              }
              authorize(e, r) {
                super.authorize(e, (o, c) => ii(this, void 0, void 0, function* () {
                  if (!o)
                    if (c = c, c.channel_data != null) {
                      var f = JSON.parse(c.channel_data);
                      this.members.setMyID(f.user_id);
                    } else if (yield this.pusher.user.signinDonePromise, this.pusher.user.user_data != null)
                      this.members.setMyID(this.pusher.user.user_data.id);
                    else {
                      let w = T.buildLogSuffix("authorizationEndpoint");
                      U.error(`Invalid auth response for channel '${this.name}', expected 'channel_data' field. ${w}, or the user should be signed in.`), r("Invalid auth response");
                      return;
                    }
                  r(o, c);
                }));
              }
              handleEvent(e) {
                var r = e.event;
                if (r.indexOf("pusher_internal:") === 0)
                  this.handleInternalEvent(e);
                else {
                  var o = e.data, c = {};
                  e.user_id && (c.user_id = e.user_id), this.emit(r, o, c);
                }
              }
              handleInternalEvent(e) {
                var r = e.event, o = e.data;
                switch (r) {
                  case "pusher_internal:subscription_succeeded":
                    this.handleSubscriptionSucceededEvent(e);
                    break;
                  case "pusher_internal:subscription_count":
                    this.handleSubscriptionCountEvent(e);
                    break;
                  case "pusher_internal:member_added":
                    var c = this.members.addMember(o);
                    this.emit("pusher:member_added", c);
                    break;
                  case "pusher_internal:member_removed":
                    var f = this.members.removeMember(o);
                    f && this.emit("pusher:member_removed", f);
                    break;
                }
              }
              handleSubscriptionSucceededEvent(e) {
                this.subscriptionPending = !1, this.subscribed = !0, this.subscriptionCancelled ? this.pusher.unsubscribe(this.name) : (this.members.onSubscription(e.data), this.emit("pusher:subscription_succeeded", this.members));
              }
              disconnect() {
                this.members.reset(), super.disconnect();
              }
            }
            var oi = l(1), pt = l(0);
            class ai extends ft {
              constructor(e, r, o) {
                super(e, r), this.key = null, this.nacl = o;
              }
              authorize(e, r) {
                super.authorize(e, (o, c) => {
                  if (o) {
                    r(o, c);
                    return;
                  }
                  let f = c.shared_secret;
                  if (!f) {
                    r(new Error(`No shared_secret key in auth payload for encrypted channel: ${this.name}`), null);
                    return;
                  }
                  this.key = Object(pt.decode)(f), delete c.shared_secret, r(null, c);
                });
              }
              trigger(e, r) {
                throw new D("Client events are not currently supported for encrypted channels");
              }
              handleEvent(e) {
                var r = e.event, o = e.data;
                if (r.indexOf("pusher_internal:") === 0 || r.indexOf("pusher:") === 0) {
                  super.handleEvent(e);
                  return;
                }
                this.handleEncryptedEvent(r, o);
              }
              handleEncryptedEvent(e, r) {
                if (!this.key) {
                  U.debug("Received encrypted event before key has been retrieved from the authEndpoint");
                  return;
                }
                if (!r.ciphertext || !r.nonce) {
                  U.error("Unexpected format for encrypted event, expected object with `ciphertext` and `nonce` fields, got: " + r);
                  return;
                }
                let o = Object(pt.decode)(r.ciphertext);
                if (o.length < this.nacl.secretbox.overheadLength) {
                  U.error(`Expected encrypted event ciphertext length to be ${this.nacl.secretbox.overheadLength}, got: ${o.length}`);
                  return;
                }
                let c = Object(pt.decode)(r.nonce);
                if (c.length < this.nacl.secretbox.nonceLength) {
                  U.error(`Expected encrypted event nonce length to be ${this.nacl.secretbox.nonceLength}, got: ${c.length}`);
                  return;
                }
                let f = this.nacl.secretbox.open(o, c, this.key);
                if (f === null) {
                  U.debug("Failed to decrypt an event, probably because it was encrypted with a different key. Fetching a new key from the authEndpoint..."), this.authorize(this.pusher.connection.socket_id, (w, P) => {
                    if (w) {
                      U.error(`Failed to make a request to the authEndpoint: ${P}. Unable to fetch new key, so dropping encrypted event`);
                      return;
                    }
                    if (f = this.nacl.secretbox.open(o, c, this.key), f === null) {
                      U.error("Failed to decrypt event with new key. Dropping encrypted event");
                      return;
                    }
                    this.emit(e, this.getDataToEmit(f));
                  });
                  return;
                }
                this.emit(e, this.getDataToEmit(f));
              }
              getDataToEmit(e) {
                let r = Object(oi.decode)(e);
                try {
                  return JSON.parse(r);
                } catch {
                  return r;
                }
              }
            }
            class ci extends se {
              constructor(e, r) {
                super(), this.state = "initialized", this.connection = null, this.key = e, this.options = r, this.timeline = this.options.timeline, this.usingTLS = this.options.useTLS, this.errorCallbacks = this.buildErrorCallbacks(), this.connectionCallbacks = this.buildConnectionCallbacks(this.errorCallbacks), this.handshakeCallbacks = this.buildHandshakeCallbacks(this.errorCallbacks);
                var o = O.getNetwork();
                o.bind("online", () => {
                  this.timeline.info({ netinfo: "online" }), (this.state === "connecting" || this.state === "unavailable") && this.retryIn(0);
                }), o.bind("offline", () => {
                  this.timeline.info({ netinfo: "offline" }), this.connection && this.sendActivityCheck();
                }), this.updateStrategy();
              }
              connect() {
                if (!(this.connection || this.runner)) {
                  if (!this.strategy.isSupported()) {
                    this.updateState("failed");
                    return;
                  }
                  this.updateState("connecting"), this.startConnecting(), this.setUnavailableTimer();
                }
              }
              send(e) {
                return this.connection ? this.connection.send(e) : !1;
              }
              send_event(e, r, o) {
                return this.connection ? this.connection.send_event(e, r, o) : !1;
              }
              disconnect() {
                this.disconnectInternally(), this.updateState("disconnected");
              }
              isUsingTLS() {
                return this.usingTLS;
              }
              startConnecting() {
                var e = (r, o) => {
                  r ? this.runner = this.strategy.connect(0, e) : o.action === "error" ? (this.emit("error", {
                    type: "HandshakeError",
                    error: o.error
                  }), this.timeline.error({ handshakeError: o.error })) : (this.abortConnecting(), this.handshakeCallbacks[o.action](o));
                };
                this.runner = this.strategy.connect(0, e);
              }
              abortConnecting() {
                this.runner && (this.runner.abort(), this.runner = null);
              }
              disconnectInternally() {
                if (this.abortConnecting(), this.clearRetryTimer(), this.clearUnavailableTimer(), this.connection) {
                  var e = this.abandonConnection();
                  e.close();
                }
              }
              updateStrategy() {
                this.strategy = this.options.getStrategy({
                  key: this.key,
                  timeline: this.timeline,
                  useTLS: this.usingTLS
                });
              }
              retryIn(e) {
                this.timeline.info({ action: "retry", delay: e }), e > 0 && this.emit("connecting_in", Math.round(e / 1e3)), this.retryTimer = new de(e || 0, () => {
                  this.disconnectInternally(), this.connect();
                });
              }
              clearRetryTimer() {
                this.retryTimer && (this.retryTimer.ensureAborted(), this.retryTimer = null);
              }
              setUnavailableTimer() {
                this.unavailableTimer = new de(this.options.unavailableTimeout, () => {
                  this.updateState("unavailable");
                });
              }
              clearUnavailableTimer() {
                this.unavailableTimer && this.unavailableTimer.ensureAborted();
              }
              sendActivityCheck() {
                this.stopActivityCheck(), this.connection.ping(), this.activityTimer = new de(this.options.pongTimeout, () => {
                  this.timeline.error({ pong_timed_out: this.options.pongTimeout }), this.retryIn(0);
                });
              }
              resetActivityCheck() {
                this.stopActivityCheck(), this.connection && !this.connection.handlesActivityChecks() && (this.activityTimer = new de(this.activityTimeout, () => {
                  this.sendActivityCheck();
                }));
              }
              stopActivityCheck() {
                this.activityTimer && this.activityTimer.ensureAborted();
              }
              buildConnectionCallbacks(e) {
                return Y({}, e, {
                  message: (r) => {
                    this.resetActivityCheck(), this.emit("message", r);
                  },
                  ping: () => {
                    this.send_event("pusher:pong", {});
                  },
                  activity: () => {
                    this.resetActivityCheck();
                  },
                  error: (r) => {
                    this.emit("error", r);
                  },
                  closed: () => {
                    this.abandonConnection(), this.shouldRetry() && this.retryIn(1e3);
                  }
                });
              }
              buildHandshakeCallbacks(e) {
                return Y({}, e, {
                  connected: (r) => {
                    this.activityTimeout = Math.min(this.options.activityTimeout, r.activityTimeout, r.connection.activityTimeout || 1 / 0), this.clearUnavailableTimer(), this.setConnection(r.connection), this.socket_id = this.connection.id, this.updateState("connected", { socket_id: this.socket_id });
                  }
                });
              }
              buildErrorCallbacks() {
                let e = (r) => (o) => {
                  o.error && this.emit("error", { type: "WebSocketError", error: o.error }), r(o);
                };
                return {
                  tls_only: e(() => {
                    this.usingTLS = !0, this.updateStrategy(), this.retryIn(0);
                  }),
                  refused: e(() => {
                    this.disconnect();
                  }),
                  backoff: e(() => {
                    this.retryIn(1e3);
                  }),
                  retry: e(() => {
                    this.retryIn(0);
                  })
                };
              }
              setConnection(e) {
                this.connection = e;
                for (var r in this.connectionCallbacks)
                  this.connection.bind(r, this.connectionCallbacks[r]);
                this.resetActivityCheck();
              }
              abandonConnection() {
                if (this.connection) {
                  this.stopActivityCheck();
                  for (var e in this.connectionCallbacks)
                    this.connection.unbind(e, this.connectionCallbacks[e]);
                  var r = this.connection;
                  return this.connection = null, r;
                }
              }
              updateState(e, r) {
                var o = this.state;
                if (this.state = e, o !== e) {
                  var c = e;
                  c === "connected" && (c += " with new socket ID " + r.socket_id), U.debug("State changed", o + " -> " + c), this.timeline.info({ state: e, params: r }), this.emit("state_change", { previous: o, current: e }), this.emit(e, r);
                }
              }
              shouldRetry() {
                return this.state === "connecting" || this.state === "connected";
              }
            }
            class ui {
              constructor() {
                this.channels = {};
              }
              add(e, r) {
                return this.channels[e] || (this.channels[e] = li(e, r)), this.channels[e];
              }
              all() {
                return xr(this.channels);
              }
              find(e) {
                return this.channels[e];
              }
              remove(e) {
                var r = this.channels[e];
                return delete this.channels[e], r;
              }
              disconnect() {
                ie(this.channels, function(e) {
                  e.disconnect();
                });
              }
            }
            function li(i, e) {
              if (i.indexOf("private-encrypted-") === 0) {
                if (e.config.nacl)
                  return oe.createEncryptedChannel(i, e, e.config.nacl);
                let r = "Tried to subscribe to a private-encrypted- channel but no nacl implementation available", o = T.buildLogSuffix("encryptedChannelSupport");
                throw new D(`${r}. ${o}`);
              } else {
                if (i.indexOf("private-") === 0)
                  return oe.createPrivateChannel(i, e);
                if (i.indexOf("presence-") === 0)
                  return oe.createPresenceChannel(i, e);
                if (i.indexOf("#") === 0)
                  throw new b('Cannot create a channel with name "' + i + '".');
                return oe.createChannel(i, e);
              }
            }
            var hi = {
              createChannels() {
                return new ui();
              },
              createConnectionManager(i, e) {
                return new ci(i, e);
              },
              createChannel(i, e) {
                return new dt(i, e);
              },
              createPrivateChannel(i, e) {
                return new ft(i, e);
              },
              createPresenceChannel(i, e) {
                return new si(i, e);
              },
              createEncryptedChannel(i, e, r) {
                return new ai(i, e, r);
              },
              createTimelineSender(i, e) {
                return new ni(i, e);
              },
              createHandshake(i, e) {
                return new ti(i, e);
              },
              createAssistantToTheTransportManager(i, e, r) {
                return new Zr(i, e, r);
              }
            }, oe = hi;
            class nn {
              constructor(e) {
                this.options = e || {}, this.livesLeft = this.options.lives || 1 / 0;
              }
              getAssistant(e) {
                return oe.createAssistantToTheTransportManager(this, e, {
                  minPingDelay: this.options.minPingDelay,
                  maxPingDelay: this.options.maxPingDelay
                });
              }
              isAlive() {
                return this.livesLeft > 0;
              }
              reportDeath() {
                this.livesLeft -= 1;
              }
            }
            class pe {
              constructor(e, r) {
                this.strategies = e, this.loop = !!r.loop, this.failFast = !!r.failFast, this.timeout = r.timeout, this.timeoutLimit = r.timeoutLimit;
              }
              isSupported() {
                return Gt(this.strategies, X.method("isSupported"));
              }
              connect(e, r) {
                var o = this.strategies, c = 0, f = this.timeout, w = null, P = (E, L) => {
                  L ? r(null, L) : (c = c + 1, this.loop && (c = c % o.length), c < o.length ? (f && (f = f * 2, this.timeoutLimit && (f = Math.min(f, this.timeoutLimit))), w = this.tryStrategy(o[c], e, { timeout: f, failFast: this.failFast }, P)) : r(!0));
                };
                return w = this.tryStrategy(o[c], e, { timeout: f, failFast: this.failFast }, P), {
                  abort: function() {
                    w.abort();
                  },
                  forceMinPriority: function(E) {
                    e = E, w && w.forceMinPriority(E);
                  }
                };
              }
              tryStrategy(e, r, o, c) {
                var f = null, w = null;
                return o.timeout > 0 && (f = new de(o.timeout, function() {
                  w.abort(), c(!0);
                })), w = e.connect(r, function(P, E) {
                  P && f && f.isRunning() && !o.failFast || (f && f.ensureAborted(), c(P, E));
                }), {
                  abort: function() {
                    f && f.ensureAborted(), w.abort();
                  },
                  forceMinPriority: function(P) {
                    w.forceMinPriority(P);
                  }
                };
              }
            }
            class _t {
              constructor(e) {
                this.strategies = e;
              }
              isSupported() {
                return Gt(this.strategies, X.method("isSupported"));
              }
              connect(e, r) {
                return di(this.strategies, e, function(o, c) {
                  return function(f, w) {
                    if (c[o].error = f, f) {
                      fi(c) && r(!0);
                      return;
                    }
                    Te(c, function(P) {
                      P.forceMinPriority(w.transport.priority);
                    }), r(null, w);
                  };
                });
              }
            }
            function di(i, e, r) {
              var o = Jt(i, function(c, f, w, P) {
                return c.connect(e, r(f, P));
              });
              return {
                abort: function() {
                  Te(o, pi);
                },
                forceMinPriority: function(c) {
                  Te(o, function(f) {
                    f.forceMinPriority(c);
                  });
                }
              };
            }
            function fi(i) {
              return Tr(i, function(e) {
                return !!e.error;
              });
            }
            function pi(i) {
              !i.error && !i.aborted && (i.abort(), i.aborted = !0);
            }
            class _i {
              constructor(e, r, o) {
                this.strategy = e, this.transports = r, this.ttl = o.ttl || 1800 * 1e3, this.usingTLS = o.useTLS, this.timeline = o.timeline;
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.usingTLS, c = vi(o), f = c && c.cacheSkipCount ? c.cacheSkipCount : 0, w = [this.strategy];
                if (c && c.timestamp + this.ttl >= X.now()) {
                  var P = this.transports[c.transport];
                  P && (["ws", "wss"].includes(c.transport) || f > 3 ? (this.timeline.info({
                    cached: !0,
                    transport: c.transport,
                    latency: c.latency
                  }), w.push(new pe([P], {
                    timeout: c.latency * 2 + 1e3,
                    failFast: !0
                  }))) : f++);
                }
                var E = X.now(), L = w.pop().connect(e, function N(z, Be) {
                  z ? (rn(o), w.length > 0 ? (E = X.now(), L = w.pop().connect(e, N)) : r(z)) : (gi(o, Be.transport.name, X.now() - E, f), r(null, Be));
                });
                return {
                  abort: function() {
                    L.abort();
                  },
                  forceMinPriority: function(N) {
                    e = N, L && L.forceMinPriority(N);
                  }
                };
              }
            }
            function vt(i) {
              return "pusherTransport" + (i ? "TLS" : "NonTLS");
            }
            function vi(i) {
              var e = O.getLocalStorage();
              if (e)
                try {
                  var r = e[vt(i)];
                  if (r)
                    return JSON.parse(r);
                } catch {
                  rn(i);
                }
              return null;
            }
            function gi(i, e, r, o) {
              var c = O.getLocalStorage();
              if (c)
                try {
                  c[vt(i)] = Me({
                    timestamp: X.now(),
                    transport: e,
                    latency: r,
                    cacheSkipCount: o
                  });
                } catch {
                }
            }
            function rn(i) {
              var e = O.getLocalStorage();
              if (e)
                try {
                  delete e[vt(i)];
                } catch {
                }
            }
            class ze {
              constructor(e, { delay: r }) {
                this.strategy = e, this.options = { delay: r };
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.strategy, c, f = new de(this.options.delay, function() {
                  c = o.connect(e, r);
                });
                return {
                  abort: function() {
                    f.ensureAborted(), c && c.abort();
                  },
                  forceMinPriority: function(w) {
                    e = w, c && c.forceMinPriority(w);
                  }
                };
              }
            }
            class Pe {
              constructor(e, r, o) {
                this.test = e, this.trueBranch = r, this.falseBranch = o;
              }
              isSupported() {
                var e = this.test() ? this.trueBranch : this.falseBranch;
                return e.isSupported();
              }
              connect(e, r) {
                var o = this.test() ? this.trueBranch : this.falseBranch;
                return o.connect(e, r);
              }
            }
            class mi {
              constructor(e) {
                this.strategy = e;
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.strategy.connect(e, function(c, f) {
                  f && o.abort(), r(c, f);
                });
                return o;
              }
            }
            function Ee(i) {
              return function() {
                return i.isSupported();
              };
            }
            var bi = function(i, e, r) {
              var o = {};
              function c(_n, ms, bs, ys, ws) {
                var vn = r(i, _n, ms, bs, ys, ws);
                return o[_n] = vn, vn;
              }
              var f = Object.assign({}, e, {
                hostNonTLS: i.wsHost + ":" + i.wsPort,
                hostTLS: i.wsHost + ":" + i.wssPort,
                httpPath: i.wsPath
              }), w = Object.assign({}, f, {
                useTLS: !0
              }), P = Object.assign({}, e, {
                hostNonTLS: i.httpHost + ":" + i.httpPort,
                hostTLS: i.httpHost + ":" + i.httpsPort,
                httpPath: i.httpPath
              }), E = {
                loop: !0,
                timeout: 15e3,
                timeoutLimit: 6e4
              }, L = new nn({
                minPingDelay: 1e4,
                maxPingDelay: i.activityTimeout
              }), N = new nn({
                lives: 2,
                minPingDelay: 1e4,
                maxPingDelay: i.activityTimeout
              }), z = c("ws", "ws", 3, f, L), Be = c("wss", "ws", 3, w, L), fs = c("sockjs", "sockjs", 1, P), un = c("xhr_streaming", "xhr_streaming", 1, P, N), ps = c("xdr_streaming", "xdr_streaming", 1, P, N), ln = c("xhr_polling", "xhr_polling", 1, P), _s = c("xdr_polling", "xdr_polling", 1, P), hn = new pe([z], E), vs = new pe([Be], E), gs = new pe([fs], E), dn = new pe([
                new Pe(Ee(un), un, ps)
              ], E), fn = new pe([
                new Pe(Ee(ln), ln, _s)
              ], E), pn = new pe([
                new Pe(Ee(dn), new _t([
                  dn,
                  new ze(fn, { delay: 4e3 })
                ]), fn)
              ], E), yt = new Pe(Ee(pn), pn, gs), wt;
              return e.useTLS ? wt = new _t([
                hn,
                new ze(yt, { delay: 2e3 })
              ]) : wt = new _t([
                hn,
                new ze(vs, { delay: 2e3 }),
                new ze(yt, { delay: 5e3 })
              ]), new _i(new mi(new Pe(Ee(z), wt, yt)), o, {
                ttl: 18e5,
                timeline: e.timeline,
                useTLS: e.useTLS
              });
            }, yi = bi, wi = (function() {
              var i = this;
              i.timeline.info(i.buildTimelineMessage({
                transport: i.name + (i.options.useTLS ? "s" : "")
              })), i.hooks.isInitialized() ? i.changeState("initialized") : i.hooks.file ? (i.changeState("initializing"), d.load(i.hooks.file, { useTLS: i.options.useTLS }, function(e, r) {
                i.hooks.isInitialized() ? (i.changeState("initialized"), r(!0)) : (e && i.onError(e), i.onClose(), r(!1));
              })) : i.onClose();
            }), Si = {
              getRequest: function(i) {
                var e = new window.XDomainRequest();
                return e.ontimeout = function() {
                  i.emit("error", new k()), i.close();
                }, e.onerror = function(r) {
                  i.emit("error", r), i.close();
                }, e.onprogress = function() {
                  e.responseText && e.responseText.length > 0 && i.onChunk(200, e.responseText);
                }, e.onload = function() {
                  e.responseText && e.responseText.length > 0 && i.onChunk(200, e.responseText), i.emit("finished", 200), i.close();
                }, e;
              },
              abortRequest: function(i) {
                i.ontimeout = i.onerror = i.onprogress = i.onload = null, i.abort();
              }
            }, xi = Si;
            const ki = 256 * 1024;
            class Ci extends se {
              constructor(e, r, o) {
                super(), this.hooks = e, this.method = r, this.url = o;
              }
              start(e) {
                this.position = 0, this.xhr = this.hooks.getRequest(this), this.unloader = () => {
                  this.close();
                }, O.addUnloadListener(this.unloader), this.xhr.open(this.method, this.url, !0), this.xhr.setRequestHeader && this.xhr.setRequestHeader("Content-Type", "application/json"), this.xhr.send(e);
              }
              close() {
                this.unloader && (O.removeUnloadListener(this.unloader), this.unloader = null), this.xhr && (this.hooks.abortRequest(this.xhr), this.xhr = null);
              }
              onChunk(e, r) {
                for (; ; ) {
                  var o = this.advanceBuffer(r);
                  if (o)
                    this.emit("chunk", { status: e, data: o });
                  else
                    break;
                }
                this.isBufferTooLong(r) && this.emit("buffer_too_long");
              }
              advanceBuffer(e) {
                var r = e.slice(this.position), o = r.indexOf(`
`);
                return o !== -1 ? (this.position += o + 1, r.slice(0, o)) : null;
              }
              isBufferTooLong(e) {
                return this.position === e.length && e.length > ki;
              }
            }
            var gt;
            (function(i) {
              i[i.CONNECTING = 0] = "CONNECTING", i[i.OPEN = 1] = "OPEN", i[i.CLOSED = 3] = "CLOSED";
            })(gt || (gt = {}));
            var _e = gt, Ti = 1;
            class Pi {
              constructor(e, r) {
                this.hooks = e, this.session = on(1e3) + "/" + Li(8), this.location = Ei(r), this.readyState = _e.CONNECTING, this.openStream();
              }
              send(e) {
                return this.sendRaw(JSON.stringify([e]));
              }
              ping() {
                this.hooks.sendHeartbeat(this);
              }
              close(e, r) {
                this.onClose(e, r, !0);
              }
              sendRaw(e) {
                if (this.readyState === _e.OPEN)
                  try {
                    return O.createSocketRequest("POST", sn(Oi(this.location, this.session))).start(e), !0;
                  } catch {
                    return !1;
                  }
                else
                  return !1;
              }
              reconnect() {
                this.closeStream(), this.openStream();
              }
              onClose(e, r, o) {
                this.closeStream(), this.readyState = _e.CLOSED, this.onclose && this.onclose({
                  code: e,
                  reason: r,
                  wasClean: o
                });
              }
              onChunk(e) {
                if (e.status === 200) {
                  this.readyState === _e.OPEN && this.onActivity();
                  var r, o = e.data.slice(0, 1);
                  switch (o) {
                    case "o":
                      r = JSON.parse(e.data.slice(1) || "{}"), this.onOpen(r);
                      break;
                    case "a":
                      r = JSON.parse(e.data.slice(1) || "[]");
                      for (var c = 0; c < r.length; c++)
                        this.onEvent(r[c]);
                      break;
                    case "m":
                      r = JSON.parse(e.data.slice(1) || "null"), this.onEvent(r);
                      break;
                    case "h":
                      this.hooks.onHeartbeat(this);
                      break;
                    case "c":
                      r = JSON.parse(e.data.slice(1) || "[]"), this.onClose(r[0], r[1], !0);
                      break;
                  }
                }
              }
              onOpen(e) {
                this.readyState === _e.CONNECTING ? (e && e.hostname && (this.location.base = Ai(this.location.base, e.hostname)), this.readyState = _e.OPEN, this.onopen && this.onopen()) : this.onClose(1006, "Server lost session", !0);
              }
              onEvent(e) {
                this.readyState === _e.OPEN && this.onmessage && this.onmessage({ data: e });
              }
              onActivity() {
                this.onactivity && this.onactivity();
              }
              onError(e) {
                this.onerror && this.onerror(e);
              }
              openStream() {
                this.stream = O.createSocketRequest("POST", sn(this.hooks.getReceiveURL(this.location, this.session))), this.stream.bind("chunk", (e) => {
                  this.onChunk(e);
                }), this.stream.bind("finished", (e) => {
                  this.hooks.onFinished(this, e);
                }), this.stream.bind("buffer_too_long", () => {
                  this.reconnect();
                });
                try {
                  this.stream.start();
                } catch (e) {
                  X.defer(() => {
                    this.onError(e), this.onClose(1006, "Could not start streaming", !1);
                  });
                }
              }
              closeStream() {
                this.stream && (this.stream.unbind_all(), this.stream.close(), this.stream = null);
              }
            }
            function Ei(i) {
              var e = /([^\?]*)\/*(\??.*)/.exec(i);
              return {
                base: e[1],
                queryString: e[2]
              };
            }
            function Oi(i, e) {
              return i.base + "/" + e + "/xhr_send";
            }
            function sn(i) {
              var e = i.indexOf("?") === -1 ? "?" : "&";
              return i + e + "t=" + +/* @__PURE__ */ new Date() + "&n=" + Ti++;
            }
            function Ai(i, e) {
              var r = /(https?:\/\/)([^\/:]+)((\/|:)?.*)/.exec(i);
              return r[1] + e + r[3];
            }
            function on(i) {
              return O.randomInt(i);
            }
            function Li(i) {
              for (var e = [], r = 0; r < i; r++)
                e.push(on(32).toString(32));
              return e.join("");
            }
            var Ri = Pi, Ii = {
              getReceiveURL: function(i, e) {
                return i.base + "/" + e + "/xhr_streaming" + i.queryString;
              },
              onHeartbeat: function(i) {
                i.sendRaw("[]");
              },
              sendHeartbeat: function(i) {
                i.sendRaw("[]");
              },
              onFinished: function(i, e) {
                i.onClose(1006, "Connection interrupted (" + e + ")", !1);
              }
            }, Ni = Ii, $i = {
              getReceiveURL: function(i, e) {
                return i.base + "/" + e + "/xhr" + i.queryString;
              },
              onHeartbeat: function() {
              },
              sendHeartbeat: function(i) {
                i.sendRaw("[]");
              },
              onFinished: function(i, e) {
                e === 200 ? i.reconnect() : i.onClose(1006, "Connection interrupted (" + e + ")", !1);
              }
            }, Ui = $i, Di = {
              getRequest: function(i) {
                var e = O.getXHRAPI(), r = new e();
                return r.onreadystatechange = r.onprogress = function() {
                  switch (r.readyState) {
                    case 3:
                      r.responseText && r.responseText.length > 0 && i.onChunk(r.status, r.responseText);
                      break;
                    case 4:
                      r.responseText && r.responseText.length > 0 && i.onChunk(r.status, r.responseText), i.emit("finished", r.status), i.close();
                      break;
                  }
                }, r;
              },
              abortRequest: function(i) {
                i.onreadystatechange = null, i.abort();
              }
            }, Hi = Di, Mi = {
              createStreamingSocket(i) {
                return this.createSocket(Ni, i);
              },
              createPollingSocket(i) {
                return this.createSocket(Ui, i);
              },
              createSocket(i, e) {
                return new Ri(i, e);
              },
              createXHR(i, e) {
                return this.createRequest(Hi, i, e);
              },
              createRequest(i, e, r) {
                return new Ci(i, e, r);
              }
            }, an = Mi;
            an.createXDR = function(i, e) {
              return this.createRequest(xi, i, e);
            };
            var ji = an, zi = {
              nextAuthCallbackID: 1,
              auth_callbacks: {},
              ScriptReceivers: h,
              DependenciesReceivers: y,
              getDefaultStrategy: yi,
              Transports: Kr,
              transportConnectionInitializer: wi,
              HTTPFactory: ji,
              TimelineTransport: Dr,
              getXHRAPI() {
                return window.XMLHttpRequest;
              },
              getWebSocketAPI() {
                return window.WebSocket || window.MozWebSocket;
              },
              setup(i) {
                window.Pusher = i;
                var e = () => {
                  this.onDocumentBody(i.ready);
                };
                window.JSON ? e() : d.load("json2", {}, e);
              },
              getDocument() {
                return document;
              },
              getProtocol() {
                return this.getDocument().location.protocol;
              },
              getAuthorizers() {
                return { ajax: V, jsonp: Rr };
              },
              onDocumentBody(i) {
                document.body ? i() : setTimeout(() => {
                  this.onDocumentBody(i);
                }, 0);
              },
              createJSONPRequest(i, e) {
                return new Nr(i, e);
              },
              createScriptRequest(i) {
                return new Ir(i);
              },
              getLocalStorage() {
                try {
                  return window.localStorage;
                } catch {
                  return;
                }
              },
              createXHR() {
                return this.getXHRAPI() ? this.createXMLHttpRequest() : this.createMicrosoftXHR();
              },
              createXMLHttpRequest() {
                var i = this.getXHRAPI();
                return new i();
              },
              createMicrosoftXHR() {
                return new ActiveXObject("Microsoft.XMLHTTP");
              },
              getNetwork() {
                return Qr;
              },
              createWebSocket(i) {
                var e = this.getWebSocketAPI();
                return new e(i);
              },
              createSocketRequest(i, e) {
                if (this.isXHRSupported())
                  return this.HTTPFactory.createXHR(i, e);
                if (this.isXDRSupported(e.indexOf("https:") === 0))
                  return this.HTTPFactory.createXDR(i, e);
                throw "Cross-origin HTTP requests are not supported";
              },
              isXHRSupported() {
                var i = this.getXHRAPI();
                return !!i && new i().withCredentials !== void 0;
              },
              isXDRSupported(i) {
                var e = i ? "https:" : "http:", r = this.getProtocol();
                return !!window.XDomainRequest && r === e;
              },
              addUnloadListener(i) {
                window.addEventListener !== void 0 ? window.addEventListener("unload", i, !1) : window.attachEvent !== void 0 && window.attachEvent("onunload", i);
              },
              removeUnloadListener(i) {
                window.addEventListener !== void 0 ? window.removeEventListener("unload", i, !1) : window.detachEvent !== void 0 && window.detachEvent("onunload", i);
              },
              randomInt(i) {
                return Math.floor(function() {
                  return (window.crypto || window.msCrypto).getRandomValues(new Uint32Array(1))[0] / Math.pow(2, 32);
                }() * i);
              }
            }, O = zi, mt;
            (function(i) {
              i[i.ERROR = 3] = "ERROR", i[i.INFO = 6] = "INFO", i[i.DEBUG = 7] = "DEBUG";
            })(mt || (mt = {}));
            var qe = mt;
            class qi {
              constructor(e, r, o) {
                this.key = e, this.session = r, this.events = [], this.options = o || {}, this.sent = 0, this.uniqueID = 0;
              }
              log(e, r) {
                e <= this.options.level && (this.events.push(Y({}, r, { timestamp: X.now() })), this.options.limit && this.events.length > this.options.limit && this.events.shift());
              }
              error(e) {
                this.log(qe.ERROR, e);
              }
              info(e) {
                this.log(qe.INFO, e);
              }
              debug(e) {
                this.log(qe.DEBUG, e);
              }
              isEmpty() {
                return this.events.length === 0;
              }
              send(e, r) {
                var o = Y({
                  session: this.session,
                  bundle: this.sent + 1,
                  key: this.key,
                  lib: "js",
                  version: this.options.version,
                  cluster: this.options.cluster,
                  features: this.options.features,
                  timeline: this.events
                }, this.options.params);
                return this.events = [], e(o, (c, f) => {
                  c || this.sent++, r && r(c, f);
                }), !0;
              }
              generateUniqueID() {
                return this.uniqueID++, this.uniqueID;
              }
            }
            class Bi {
              constructor(e, r, o, c) {
                this.name = e, this.priority = r, this.transport = o, this.options = c || {};
              }
              isSupported() {
                return this.transport.isSupported({
                  useTLS: this.options.useTLS
                });
              }
              connect(e, r) {
                if (this.isSupported()) {
                  if (this.priority < e)
                    return cn(new A(), r);
                } else return cn(new K(), r);
                var o = !1, c = this.transport.createConnection(this.name, this.priority, this.options.key, this.options), f = null, w = function() {
                  c.unbind("initialized", w), c.connect();
                }, P = function() {
                  f = oe.createHandshake(c, function(z) {
                    o = !0, N(), r(null, z);
                  });
                }, E = function(z) {
                  N(), r(z);
                }, L = function() {
                  N();
                  var z;
                  z = Me(c), r(new $(z));
                }, N = function() {
                  c.unbind("initialized", w), c.unbind("open", P), c.unbind("error", E), c.unbind("closed", L);
                };
                return c.bind("initialized", w), c.bind("open", P), c.bind("error", E), c.bind("closed", L), c.initialize(), {
                  abort: () => {
                    o || (N(), f ? f.close() : c.close());
                  },
                  forceMinPriority: (z) => {
                    o || this.priority < z && (f ? f.close() : c.close());
                  }
                };
              }
            }
            function cn(i, e) {
              return X.defer(function() {
                e(i);
              }), {
                abort: function() {
                },
                forceMinPriority: function() {
                }
              };
            }
            const { Transports: Fi } = O;
            var Wi = function(i, e, r, o, c, f) {
              var w = Fi[r];
              if (!w)
                throw new G(r);
              var P = (!i.enabledTransports || Ft(i.enabledTransports, e) !== -1) && (!i.disabledTransports || Ft(i.disabledTransports, e) === -1), E;
              return P ? (c = Object.assign({ ignoreNullOrigin: i.ignoreNullOrigin }, c), E = new Bi(e, o, f ? f.getAssistant(w) : w, c)) : E = Ji, E;
            }, Ji = {
              isSupported: function() {
                return !1;
              },
              connect: function(i, e) {
                var r = X.defer(function() {
                  e(new K());
                });
                return {
                  abort: function() {
                    r.ensureAborted();
                  },
                  forceMinPriority: function() {
                  }
                };
              }
            };
            function Xi(i) {
              if (i == null)
                throw "You must pass an options object";
              if (i.cluster == null)
                throw "Options object must provide a cluster";
              "disableStats" in i && U.warn("The disableStats option is deprecated in favor of enableStats");
            }
            const Vi = (i, e) => {
              var r = "socket_id=" + encodeURIComponent(i.socketId);
              for (var o in e.params)
                r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(e.params[o]);
              if (e.paramsProvider != null) {
                let c = e.paramsProvider();
                for (var o in c)
                  r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(c[o]);
              }
              return r;
            };
            var Gi = (i) => {
              if (typeof O.getAuthorizers()[i.transport] > "u")
                throw `'${i.transport}' is not a recognized auth transport`;
              return (e, r) => {
                const o = Vi(e, i);
                O.getAuthorizers()[i.transport](O, o, i, C.UserAuthentication, r);
              };
            };
            const Ki = (i, e) => {
              var r = "socket_id=" + encodeURIComponent(i.socketId);
              r += "&channel_name=" + encodeURIComponent(i.channelName);
              for (var o in e.params)
                r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(e.params[o]);
              if (e.paramsProvider != null) {
                let c = e.paramsProvider();
                for (var o in c)
                  r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(c[o]);
              }
              return r;
            };
            var Yi = (i) => {
              if (typeof O.getAuthorizers()[i.transport] > "u")
                throw `'${i.transport}' is not a recognized auth transport`;
              return (e, r) => {
                const o = Ki(e, i);
                O.getAuthorizers()[i.transport](O, o, i, C.ChannelAuthorization, r);
              };
            };
            const Qi = (i, e, r) => {
              const o = {
                authTransport: e.transport,
                authEndpoint: e.endpoint,
                auth: {
                  params: e.params,
                  headers: e.headers
                }
              };
              return (c, f) => {
                const w = i.channel(c.channelName);
                r(w, o).authorize(c.socketId, f);
              };
            };
            function Zi(i, e) {
              let r = {
                activityTimeout: i.activityTimeout || _.activityTimeout,
                cluster: i.cluster,
                httpPath: i.httpPath || _.httpPath,
                httpPort: i.httpPort || _.httpPort,
                httpsPort: i.httpsPort || _.httpsPort,
                pongTimeout: i.pongTimeout || _.pongTimeout,
                statsHost: i.statsHost || _.stats_host,
                unavailableTimeout: i.unavailableTimeout || _.unavailableTimeout,
                wsPath: i.wsPath || _.wsPath,
                wsPort: i.wsPort || _.wsPort,
                wssPort: i.wssPort || _.wssPort,
                enableStats: is(i),
                httpHost: es(i),
                useTLS: rs(i),
                wsHost: ts(i),
                userAuthenticator: ss(i),
                channelAuthorizer: as(i, e)
              };
              return "disabledTransports" in i && (r.disabledTransports = i.disabledTransports), "enabledTransports" in i && (r.enabledTransports = i.enabledTransports), "ignoreNullOrigin" in i && (r.ignoreNullOrigin = i.ignoreNullOrigin), "timelineParams" in i && (r.timelineParams = i.timelineParams), "nacl" in i && (r.nacl = i.nacl), r;
            }
            function es(i) {
              return i.httpHost ? i.httpHost : i.cluster ? `sockjs-${i.cluster}.pusher.com` : _.httpHost;
            }
            function ts(i) {
              return i.wsHost ? i.wsHost : ns(i.cluster);
            }
            function ns(i) {
              return `ws-${i}.pusher.com`;
            }
            function rs(i) {
              return O.getProtocol() === "https:" ? !0 : i.forceTLS !== !1;
            }
            function is(i) {
              return "enableStats" in i ? i.enableStats : "disableStats" in i ? !i.disableStats : !1;
            }
            function ss(i) {
              const e = Object.assign(Object.assign({}, _.userAuthentication), i.userAuthentication);
              return "customHandler" in e && e.customHandler != null ? e.customHandler : Gi(e);
            }
            function os(i, e) {
              let r;
              return "channelAuthorization" in i ? r = Object.assign(Object.assign({}, _.channelAuthorization), i.channelAuthorization) : (r = {
                transport: i.authTransport || _.authTransport,
                endpoint: i.authEndpoint || _.authEndpoint
              }, "auth" in i && ("params" in i.auth && (r.params = i.auth.params), "headers" in i.auth && (r.headers = i.auth.headers)), "authorizer" in i && (r.customHandler = Qi(e, r, i.authorizer))), r;
            }
            function as(i, e) {
              const r = os(i, e);
              return "customHandler" in r && r.customHandler != null ? r.customHandler : Yi(r);
            }
            class cs extends se {
              constructor(e) {
                super(function(r, o) {
                  U.debug(`No callbacks on watchlist events for ${r}`);
                }), this.pusher = e, this.bindWatchlistInternalEvent();
              }
              handleEvent(e) {
                e.data.events.forEach((r) => {
                  this.emit(r.name, r);
                });
              }
              bindWatchlistInternalEvent() {
                this.pusher.connection.bind("message", (e) => {
                  var r = e.event;
                  r === "pusher_internal:watchlist_events" && this.handleEvent(e);
                });
              }
            }
            function us() {
              let i, e;
              return { promise: new Promise((o, c) => {
                i = o, e = c;
              }), resolve: i, reject: e };
            }
            var ls = us;
            class hs extends se {
              constructor(e) {
                super(function(r, o) {
                  U.debug("No callbacks on user for " + r);
                }), this.signin_requested = !1, this.user_data = null, this.serverToUserChannel = null, this.signinDonePromise = null, this._signinDoneResolve = null, this._onAuthorize = (r, o) => {
                  if (r) {
                    U.warn(`Error during signin: ${r}`), this._cleanup();
                    return;
                  }
                  this.pusher.send_event("pusher:signin", {
                    auth: o.auth,
                    user_data: o.user_data
                  });
                }, this.pusher = e, this.pusher.connection.bind("state_change", ({ previous: r, current: o }) => {
                  r !== "connected" && o === "connected" && this._signin(), r === "connected" && o !== "connected" && (this._cleanup(), this._newSigninPromiseIfNeeded());
                }), this.watchlist = new cs(e), this.pusher.connection.bind("message", (r) => {
                  var o = r.event;
                  o === "pusher:signin_success" && this._onSigninSuccess(r.data), this.serverToUserChannel && this.serverToUserChannel.name === r.channel && this.serverToUserChannel.handleEvent(r);
                });
              }
              signin() {
                this.signin_requested || (this.signin_requested = !0, this._signin());
              }
              _signin() {
                this.signin_requested && (this._newSigninPromiseIfNeeded(), this.pusher.connection.state === "connected" && this.pusher.config.userAuthenticator({
                  socketId: this.pusher.connection.socket_id
                }, this._onAuthorize));
              }
              _onSigninSuccess(e) {
                try {
                  this.user_data = JSON.parse(e.user_data);
                } catch {
                  U.error(`Failed parsing user data after signin: ${e.user_data}`), this._cleanup();
                  return;
                }
                if (typeof this.user_data.id != "string" || this.user_data.id === "") {
                  U.error(`user_data doesn't contain an id. user_data: ${this.user_data}`), this._cleanup();
                  return;
                }
                this._signinDoneResolve(), this._subscribeChannels();
              }
              _subscribeChannels() {
                const e = (r) => {
                  r.subscriptionPending && r.subscriptionCancelled ? r.reinstateSubscription() : !r.subscriptionPending && this.pusher.connection.state === "connected" && r.subscribe();
                };
                this.serverToUserChannel = new dt(`#server-to-user-${this.user_data.id}`, this.pusher), this.serverToUserChannel.bind_global((r, o) => {
                  r.indexOf("pusher_internal:") === 0 || r.indexOf("pusher:") === 0 || this.emit(r, o);
                }), e(this.serverToUserChannel);
              }
              _cleanup() {
                this.user_data = null, this.serverToUserChannel && (this.serverToUserChannel.unbind_all(), this.serverToUserChannel.disconnect(), this.serverToUserChannel = null), this.signin_requested && this._signinDoneResolve();
              }
              _newSigninPromiseIfNeeded() {
                if (!this.signin_requested || this.signinDonePromise && !this.signinDonePromise.done)
                  return;
                const { promise: e, resolve: r } = ls();
                e.done = !1;
                const o = () => {
                  e.done = !0;
                };
                e.then(o).catch(o), this.signinDonePromise = e, this._signinDoneResolve = r;
              }
            }
            class B {
              static ready() {
                B.isReady = !0;
                for (var e = 0, r = B.instances.length; e < r; e++)
                  B.instances[e].connect();
              }
              static getClientFeatures() {
                return Wt(Vt({ ws: O.Transports.ws }, function(e) {
                  return e.isSupported({});
                }));
              }
              constructor(e, r) {
                ds(e), Xi(r), this.key = e, this.config = Zi(r, this), this.channels = oe.createChannels(), this.global_emitter = new se(), this.sessionID = O.randomInt(1e9), this.timeline = new qi(this.key, this.sessionID, {
                  cluster: this.config.cluster,
                  features: B.getClientFeatures(),
                  params: this.config.timelineParams || {},
                  limit: 50,
                  level: qe.INFO,
                  version: _.VERSION
                }), this.config.enableStats && (this.timelineSender = oe.createTimelineSender(this.timeline, {
                  host: this.config.statsHost,
                  path: "/timeline/v2/" + O.TimelineTransport.name
                }));
                var o = (c) => O.getDefaultStrategy(this.config, c, Wi);
                this.connection = oe.createConnectionManager(this.key, {
                  getStrategy: o,
                  timeline: this.timeline,
                  activityTimeout: this.config.activityTimeout,
                  pongTimeout: this.config.pongTimeout,
                  unavailableTimeout: this.config.unavailableTimeout,
                  useTLS: !!this.config.useTLS
                }), this.connection.bind("connected", () => {
                  this.subscribeAll(), this.timelineSender && this.timelineSender.send(this.connection.isUsingTLS());
                }), this.connection.bind("message", (c) => {
                  var f = c.event, w = f.indexOf("pusher_internal:") === 0;
                  if (c.channel) {
                    var P = this.channel(c.channel);
                    P && P.handleEvent(c);
                  }
                  w || this.global_emitter.emit(c.event, c.data);
                }), this.connection.bind("connecting", () => {
                  this.channels.disconnect();
                }), this.connection.bind("disconnected", () => {
                  this.channels.disconnect();
                }), this.connection.bind("error", (c) => {
                  U.warn(c);
                }), B.instances.push(this), this.timeline.info({ instances: B.instances.length }), this.user = new hs(this), B.isReady && this.connect();
              }
              channel(e) {
                return this.channels.find(e);
              }
              allChannels() {
                return this.channels.all();
              }
              connect() {
                if (this.connection.connect(), this.timelineSender && !this.timelineSenderTimer) {
                  var e = this.connection.isUsingTLS(), r = this.timelineSender;
                  this.timelineSenderTimer = new yr(6e4, function() {
                    r.send(e);
                  });
                }
              }
              disconnect() {
                this.connection.disconnect(), this.timelineSenderTimer && (this.timelineSenderTimer.ensureAborted(), this.timelineSenderTimer = null);
              }
              bind(e, r, o) {
                return this.global_emitter.bind(e, r, o), this;
              }
              unbind(e, r, o) {
                return this.global_emitter.unbind(e, r, o), this;
              }
              bind_global(e) {
                return this.global_emitter.bind_global(e), this;
              }
              unbind_global(e) {
                return this.global_emitter.unbind_global(e), this;
              }
              unbind_all(e) {
                return this.global_emitter.unbind_all(), this;
              }
              subscribeAll() {
                var e;
                for (e in this.channels.channels)
                  this.channels.channels.hasOwnProperty(e) && this.subscribe(e);
              }
              subscribe(e) {
                var r = this.channels.add(e, this);
                return r.subscriptionPending && r.subscriptionCancelled ? r.reinstateSubscription() : !r.subscriptionPending && this.connection.state === "connected" && r.subscribe(), r;
              }
              unsubscribe(e) {
                var r = this.channels.find(e);
                r && r.subscriptionPending ? r.cancelSubscription() : (r = this.channels.remove(e), r && r.subscribed && r.unsubscribe());
              }
              send_event(e, r, o) {
                return this.connection.send_event(e, r, o);
              }
              shouldUseTLS() {
                return this.config.useTLS;
              }
              signin() {
                this.user.signin();
              }
            }
            B.instances = [], B.isReady = !1, B.logToConsole = !1, B.Runtime = O, B.ScriptReceivers = O.ScriptReceivers, B.DependenciesReceivers = O.DependenciesReceivers, B.auth_callbacks = O.auth_callbacks;
            var bt = a.default = B;
            function ds(i) {
              if (i == null)
                throw "You must pass your app key when you instantiate Pusher.";
            }
            O.setup(B);
          })
          /******/
        ])
      );
    });
  })(kt)), kt.exports;
}
var hr = Lo();
const Ro = /* @__PURE__ */ Ao(hr), Io = /* @__PURE__ */ Ss({
  __proto__: null,
  default: Ro
}, [hr]);
export {
  Oo as default
};
