function Es(n, t) {
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
var it, R, Un, Dn, ve, vn, Hn, Mn, jn, $t, Tt, Pt, Ge = {}, Ke = [], Os = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, st = Array.isArray;
function ce(n, t) {
  for (var s in t) n[s] = t[s];
  return n;
}
function Ut(n) {
  n && n.parentNode && n.parentNode.removeChild(n);
}
function zn(n, t, s) {
  var a, l, u, h = {};
  for (u in t) u == "key" ? a = t[u] : u == "ref" ? l = t[u] : h[u] = t[u];
  if (arguments.length > 2 && (h.children = arguments.length > 3 ? it.call(arguments, 2) : s), typeof n == "function" && n.defaultProps != null) for (u in n.defaultProps) h[u] === void 0 && (h[u] = n.defaultProps[u]);
  return Xe(n, h, a, l, null);
}
function Xe(n, t, s, a, l) {
  var u = { type: n, props: t, key: s, ref: a, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: l ?? ++Un, __i: -1, __u: 0 };
  return l == null && R.vnode != null && R.vnode(u), u;
}
function le(n) {
  return n.children;
}
function Le(n, t) {
  this.props = n, this.context = t;
}
function xe(n, t) {
  if (t == null) return n.__ ? xe(n.__, n.__i + 1) : null;
  for (var s; t < n.__k.length; t++) if ((s = n.__k[t]) != null && s.__e != null) return s.__e;
  return typeof n.type == "function" ? xe(n) : null;
}
function As(n) {
  if (n.__P && n.__d) {
    var t = n.__v, s = t.__e, a = [], l = [], u = ce({}, t);
    u.__v = t.__v + 1, R.vnode && R.vnode(u), Dt(n.__P, u, t, n.__n, n.__P.namespaceURI, 32 & t.__u ? [s] : null, a, s ?? xe(t), !!(32 & t.__u), l), u.__v = t.__v, u.__.__k[u.__i] = u, Wn(a, u, l), t.__e = t.__ = null, u.__e != s && qn(u);
  }
}
function qn(n) {
  if ((n = n.__) != null && n.__c != null) return n.__e = n.__c.base = null, n.__k.some(function(t) {
    if (t != null && t.__e != null) return n.__e = n.__c.base = t.__e;
  }), qn(n);
}
function gn(n) {
  (!n.__d && (n.__d = !0) && ve.push(n) && !Ye.__r++ || vn != R.debounceRendering) && ((vn = R.debounceRendering) || Hn)(Ye);
}
function Ye() {
  for (var n, t = 1; ve.length; ) ve.length > t && ve.sort(Mn), n = ve.shift(), t = ve.length, As(n);
  Ye.__r = 0;
}
function Bn(n, t, s, a, l, u, h, f, _, v, y) {
  var d, S, b, T, C, g, m, x = a && a.__k || Ke, A = t.length;
  for (_ = Is(s, t, x, _, A), d = 0; d < A; d++) (b = s.__k[d]) != null && (S = b.__i != -1 && x[b.__i] || Ge, b.__i = d, g = Dt(n, b, S, l, u, h, f, _, v, y), T = b.__e, b.ref && S.ref != b.ref && (S.ref && Ht(S.ref, null, b), y.push(b.ref, b.__c || T, b)), C == null && T != null && (C = T), (m = !!(4 & b.__u)) || S.__k === b.__k ? _ = Fn(b, _, n, m) : typeof b.type == "function" && g !== void 0 ? _ = g : T && (_ = T.nextSibling), b.__u &= -7);
  return s.__e = C, _;
}
function Is(n, t, s, a, l) {
  var u, h, f, _, v, y = s.length, d = y, S = 0;
  for (n.__k = new Array(l), u = 0; u < l; u++) (h = t[u]) != null && typeof h != "boolean" && typeof h != "function" ? (typeof h == "string" || typeof h == "number" || typeof h == "bigint" || h.constructor == String ? h = n.__k[u] = Xe(null, h, null, null, null) : st(h) ? h = n.__k[u] = Xe(le, { children: h }, null, null, null) : h.constructor === void 0 && h.__b > 0 ? h = n.__k[u] = Xe(h.type, h.props, h.key, h.ref ? h.ref : null, h.__v) : n.__k[u] = h, _ = u + S, h.__ = n, h.__b = n.__b + 1, f = null, (v = h.__i = Ls(h, s, _, d)) != -1 && (d--, (f = s[v]) && (f.__u |= 2)), f == null || f.__v == null ? (v == -1 && (l > y ? S-- : l < y && S++), typeof h.type != "function" && (h.__u |= 4)) : v != _ && (v == _ - 1 ? S-- : v == _ + 1 ? S++ : (v > _ ? S-- : S++, h.__u |= 4))) : n.__k[u] = null;
  if (d) for (u = 0; u < y; u++) (f = s[u]) != null && (2 & f.__u) == 0 && (f.__e == a && (a = xe(f)), Xn(f, f));
  return a;
}
function Fn(n, t, s, a) {
  var l, u;
  if (typeof n.type == "function") {
    for (l = n.__k, u = 0; l && u < l.length; u++) l[u] && (l[u].__ = n, t = Fn(l[u], t, s, a));
    return t;
  }
  n.__e != t && (a && (t && n.type && !t.parentNode && (t = xe(n)), s.insertBefore(n.__e, t || null)), t = n.__e);
  do
    t = t && t.nextSibling;
  while (t != null && t.nodeType == 8);
  return t;
}
function Ls(n, t, s, a) {
  var l, u, h, f = n.key, _ = n.type, v = t[s], y = v != null && (2 & v.__u) == 0;
  if (v === null && f == null || y && f == v.key && _ == v.type) return s;
  if (a > (y ? 1 : 0)) {
    for (l = s - 1, u = s + 1; l >= 0 || u < t.length; ) if ((v = t[h = l >= 0 ? l-- : u++]) != null && (2 & v.__u) == 0 && f == v.key && _ == v.type) return h;
  }
  return -1;
}
function mn(n, t, s) {
  t[0] == "-" ? n.setProperty(t, s ?? "") : n[t] = s == null ? "" : typeof s != "number" || Os.test(t) ? s : s + "px";
}
function Fe(n, t, s, a, l) {
  var u, h;
  e: if (t == "style") if (typeof s == "string") n.style.cssText = s;
  else {
    if (typeof a == "string" && (n.style.cssText = a = ""), a) for (t in a) s && t in s || mn(n.style, t, "");
    if (s) for (t in s) a && s[t] == a[t] || mn(n.style, t, s[t]);
  }
  else if (t[0] == "o" && t[1] == "n") u = t != (t = t.replace(jn, "$1")), h = t.toLowerCase(), t = h in n || t == "onFocusOut" || t == "onFocusIn" ? h.slice(2) : t.slice(2), n.l || (n.l = {}), n.l[t + u] = s, s ? a ? s.u = a.u : (s.u = $t, n.addEventListener(t, u ? Pt : Tt, u)) : n.removeEventListener(t, u ? Pt : Tt, u);
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
function bn(n) {
  return function(t) {
    if (this.l) {
      var s = this.l[t.type + n];
      if (t.t == null) t.t = $t++;
      else if (t.t < s.u) return;
      return s(R.event ? R.event(t) : t);
    }
  };
}
function Dt(n, t, s, a, l, u, h, f, _, v) {
  var y, d, S, b, T, C, g, m, x, A, $, D, K, Y, X, M = t.type;
  if (t.constructor !== void 0) return null;
  128 & s.__u && (_ = !!(32 & s.__u), u = [f = t.__e = s.__e]), (y = R.__b) && y(t);
  e: if (typeof M == "function") try {
    if (m = t.props, x = "prototype" in M && M.prototype.render, A = (y = M.contextType) && a[y.__c], $ = y ? A ? A.props.value : y.__ : a, s.__c ? g = (d = t.__c = s.__c).__ = d.__E : (x ? t.__c = d = new M(m, $) : (t.__c = d = new Le(m, $), d.constructor = M, d.render = Ns), A && A.sub(d), d.state || (d.state = {}), d.__n = a, S = d.__d = !0, d.__h = [], d._sb = []), x && d.__s == null && (d.__s = d.state), x && M.getDerivedStateFromProps != null && (d.__s == d.state && (d.__s = ce({}, d.__s)), ce(d.__s, M.getDerivedStateFromProps(m, d.__s))), b = d.props, T = d.state, d.__v = t, S) x && M.getDerivedStateFromProps == null && d.componentWillMount != null && d.componentWillMount(), x && d.componentDidMount != null && d.__h.push(d.componentDidMount);
    else {
      if (x && M.getDerivedStateFromProps == null && m !== b && d.componentWillReceiveProps != null && d.componentWillReceiveProps(m, $), t.__v == s.__v || !d.__e && d.shouldComponentUpdate != null && d.shouldComponentUpdate(m, d.__s, $) === !1) {
        t.__v != s.__v && (d.props = m, d.state = d.__s, d.__d = !1), t.__e = s.__e, t.__k = s.__k, t.__k.some(function(G) {
          G && (G.__ = t);
        }), Ke.push.apply(d.__h, d._sb), d._sb = [], d.__h.length && h.push(d);
        break e;
      }
      d.componentWillUpdate != null && d.componentWillUpdate(m, d.__s, $), x && d.componentDidUpdate != null && d.__h.push(function() {
        d.componentDidUpdate(b, T, C);
      });
    }
    if (d.context = $, d.props = m, d.__P = n, d.__e = !1, D = R.__r, K = 0, x) d.state = d.__s, d.__d = !1, D && D(t), y = d.render(d.props, d.state, d.context), Ke.push.apply(d.__h, d._sb), d._sb = [];
    else do
      d.__d = !1, D && D(t), y = d.render(d.props, d.state, d.context), d.state = d.__s;
    while (d.__d && ++K < 25);
    d.state = d.__s, d.getChildContext != null && (a = ce(ce({}, a), d.getChildContext())), x && !S && d.getSnapshotBeforeUpdate != null && (C = d.getSnapshotBeforeUpdate(b, T)), Y = y != null && y.type === le && y.key == null ? Jn(y.props.children) : y, f = Bn(n, st(Y) ? Y : [Y], t, s, a, l, u, h, f, _, v), d.base = t.__e, t.__u &= -161, d.__h.length && h.push(d), g && (d.__E = d.__ = null);
  } catch (G) {
    if (t.__v = null, _ || u != null) if (G.then) {
      for (t.__u |= _ ? 160 : 128; f && f.nodeType == 8 && f.nextSibling; ) f = f.nextSibling;
      u[u.indexOf(f)] = null, t.__e = f;
    } else {
      for (X = u.length; X--; ) Ut(u[X]);
      Et(t);
    }
    else t.__e = s.__e, t.__k = s.__k, G.then || Et(t);
    R.__e(G, t, s);
  }
  else u == null && t.__v == s.__v ? (t.__k = s.__k, t.__e = s.__e) : f = t.__e = Rs(s.__e, t, s, a, l, u, h, _, v);
  return (y = R.diffed) && y(t), 128 & t.__u ? void 0 : f;
}
function Et(n) {
  n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some(Et));
}
function Wn(n, t, s) {
  for (var a = 0; a < s.length; a++) Ht(s[a], s[++a], s[++a]);
  R.__c && R.__c(t, n), n.some(function(l) {
    try {
      n = l.__h, l.__h = [], n.some(function(u) {
        u.call(l);
      });
    } catch (u) {
      R.__e(u, l.__v);
    }
  });
}
function Jn(n) {
  return typeof n != "object" || n == null || n.__b > 0 ? n : st(n) ? n.map(Jn) : ce({}, n);
}
function Rs(n, t, s, a, l, u, h, f, _) {
  var v, y, d, S, b, T, C, g = s.props || Ge, m = t.props, x = t.type;
  if (x == "svg" ? l = "http://www.w3.org/2000/svg" : x == "math" ? l = "http://www.w3.org/1998/Math/MathML" : l || (l = "http://www.w3.org/1999/xhtml"), u != null) {
    for (v = 0; v < u.length; v++) if ((b = u[v]) && "setAttribute" in b == !!x && (x ? b.localName == x : b.nodeType == 3)) {
      n = b, u[v] = null;
      break;
    }
  }
  if (n == null) {
    if (x == null) return document.createTextNode(m);
    n = document.createElementNS(l, x, m.is && m), f && (R.__m && R.__m(t, u), f = !1), u = null;
  }
  if (x == null) g === m || f && n.data == m || (n.data = m);
  else {
    if (u = u && it.call(n.childNodes), !f && u != null) for (g = {}, v = 0; v < n.attributes.length; v++) g[(b = n.attributes[v]).name] = b.value;
    for (v in g) b = g[v], v == "dangerouslySetInnerHTML" ? d = b : v == "children" || v in m || v == "value" && "defaultValue" in m || v == "checked" && "defaultChecked" in m || Fe(n, v, null, b, l);
    for (v in m) b = m[v], v == "children" ? S = b : v == "dangerouslySetInnerHTML" ? y = b : v == "value" ? T = b : v == "checked" ? C = b : f && typeof b != "function" || g[v] === b || Fe(n, v, b, g[v], l);
    if (y) f || d && (y.__html == d.__html || y.__html == n.innerHTML) || (n.innerHTML = y.__html), t.__k = [];
    else if (d && (n.innerHTML = ""), Bn(t.type == "template" ? n.content : n, st(S) ? S : [S], t, s, a, x == "foreignObject" ? "http://www.w3.org/1999/xhtml" : l, u, h, u ? u[0] : s.__k && xe(s, 0), f, _), u != null) for (v = u.length; v--; ) Ut(u[v]);
    f || (v = "value", x == "progress" && T == null ? n.removeAttribute("value") : T != null && (T !== n[v] || x == "progress" && !T || x == "option" && T != g[v]) && Fe(n, v, T, g[v], l), v = "checked", C != null && C != n[v] && Fe(n, v, C, g[v], l));
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
    R.__e(l, s);
  }
}
function Xn(n, t, s) {
  var a, l;
  if (R.unmount && R.unmount(n), (a = n.ref) && (a.current && a.current != n.__e || Ht(a, null, t)), (a = n.__c) != null) {
    if (a.componentWillUnmount) try {
      a.componentWillUnmount();
    } catch (u) {
      R.__e(u, t);
    }
    a.base = a.__P = null;
  }
  if (a = n.__k) for (l = 0; l < a.length; l++) a[l] && Xn(a[l], t, s || typeof n.type != "function");
  s || Ut(n.__e), n.__c = n.__ = n.__e = void 0;
}
function Ns(n, t, s) {
  return this.constructor(n, s);
}
function Vn(n, t, s) {
  var a, l, u, h;
  t == document && (t = document.documentElement), R.__ && R.__(n, t), l = (a = !1) ? null : t.__k, u = [], h = [], Dt(t, n = t.__k = zn(le, null, [n]), l || Ge, Ge, t.namespaceURI, l ? null : t.firstChild ? it.call(t.childNodes) : null, u, l ? l.__e : t.firstChild, a, h), Wn(u, n, h);
}
it = Ke.slice, R = { __e: function(n, t, s, a) {
  for (var l, u, h; t = t.__; ) if ((l = t.__c) && !l.__) try {
    if ((u = l.constructor) && u.getDerivedStateFromError != null && (l.setState(u.getDerivedStateFromError(n)), h = l.__d), l.componentDidCatch != null && (l.componentDidCatch(n, a || {}), h = l.__d), h) return l.__E = l;
  } catch (f) {
    n = f;
  }
  throw n;
} }, Un = 0, Dn = function(n) {
  return n != null && n.constructor === void 0;
}, Le.prototype.setState = function(n, t) {
  var s;
  s = this.__s != null && this.__s != this.state ? this.__s : this.__s = ce({}, this.state), typeof n == "function" && (n = n(ce({}, s), this.props)), n && ce(s, n), n != null && this.__v && (t && this._sb.push(t), gn(this));
}, Le.prototype.forceUpdate = function(n) {
  this.__v && (this.__e = !0, n && this.__h.push(n), gn(this));
}, Le.prototype.render = le, ve = [], Hn = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Mn = function(n, t) {
  return n.__v.__b - t.__v.__b;
}, Ye.__r = 0, jn = /(PointerCapture)$|Capture$/i, $t = 0, Tt = bn(!1), Pt = bn(!0);
var $e, H, St, yn, Qe = 0, Gn = [], z = R, wn = z.__b, Sn = z.__r, xn = z.diffed, kn = z.__c, Cn = z.unmount, Tn = z.__;
function Mt(n, t) {
  z.__h && z.__h(H, n, Qe || t), Qe = 0;
  var s = H.__H || (H.__H = { __: [], __h: [] });
  return n >= s.__.length && s.__.push({}), s.__[n];
}
function ae(n) {
  return Qe = 1, $s(Yn, n);
}
function $s(n, t, s) {
  var a = Mt($e++, 2);
  if (a.t = n, !a.__c && (a.__ = [Yn(void 0, t), function(f) {
    var _ = a.__N ? a.__N[0] : a.__[0], v = a.t(_, f);
    _ !== v && (a.__N = [v, a.__[1]], a.__c.setState({}));
  }], a.__c = H, !H.__f)) {
    var l = function(f, _, v) {
      if (!a.__c.__H) return !0;
      var y = a.__c.__H.__.filter(function(S) {
        return S.__c;
      });
      if (y.every(function(S) {
        return !S.__N;
      })) return !u || u.call(this, f, _, v);
      var d = a.__c.props !== f;
      return y.some(function(S) {
        if (S.__N) {
          var b = S.__[0];
          S.__ = S.__N, S.__N = void 0, b !== S.__[0] && (d = !0);
        }
      }), u && u.call(this, f, _, v) || d;
    };
    H.__f = !0;
    var u = H.shouldComponentUpdate, h = H.componentWillUpdate;
    H.componentWillUpdate = function(f, _, v) {
      if (this.__e) {
        var y = u;
        u = void 0, l(f, _, v), u = y;
      }
      h && h.call(this, f, _, v);
    }, H.shouldComponentUpdate = l;
  }
  return a.__N || a.__;
}
function Ie(n, t) {
  var s = Mt($e++, 3);
  !z.__s && Kn(s.__H, t) && (s.__ = n, s.u = t, H.__H.__h.push(s));
}
function we(n) {
  return Qe = 5, jt(function() {
    return { current: n };
  }, []);
}
function jt(n, t) {
  var s = Mt($e++, 7);
  return Kn(s.__H, t) && (s.__ = n(), s.__H = t, s.__h = n), s.__;
}
function Us() {
  for (var n; n = Gn.shift(); ) {
    var t = n.__H;
    if (n.__P && t) try {
      t.__h.some(Ve), t.__h.some(Ot), t.__h = [];
    } catch (s) {
      t.__h = [], z.__e(s, n.__v);
    }
  }
}
z.__b = function(n) {
  H = null, wn && wn(n);
}, z.__ = function(n, t) {
  n && t.__k && t.__k.__m && (n.__m = t.__k.__m), Tn && Tn(n, t);
}, z.__r = function(n) {
  Sn && Sn(n), $e = 0;
  var t = (H = n.__c).__H;
  t && (St === H ? (t.__h = [], H.__h = [], t.__.some(function(s) {
    s.__N && (s.__ = s.__N), s.u = s.__N = void 0;
  })) : (t.__h.some(Ve), t.__h.some(Ot), t.__h = [], $e = 0)), St = H;
}, z.diffed = function(n) {
  xn && xn(n);
  var t = n.__c;
  t && t.__H && (t.__H.__h.length && (Gn.push(t) !== 1 && yn === z.requestAnimationFrame || ((yn = z.requestAnimationFrame) || Ds)(Us)), t.__H.__.some(function(s) {
    s.u && (s.__H = s.u), s.u = void 0;
  })), St = H = null;
}, z.__c = function(n, t) {
  t.some(function(s) {
    try {
      s.__h.some(Ve), s.__h = s.__h.filter(function(a) {
        return !a.__ || Ot(a);
      });
    } catch (a) {
      t.some(function(l) {
        l.__h && (l.__h = []);
      }), t = [], z.__e(a, s.__v);
    }
  }), kn && kn(n, t);
}, z.unmount = function(n) {
  Cn && Cn(n);
  var t, s = n.__c;
  s && s.__H && (s.__H.__.some(function(a) {
    try {
      Ve(a);
    } catch (l) {
      t = l;
    }
  }), s.__H = void 0, t && z.__e(t, s.__v));
};
var Pn = typeof requestAnimationFrame == "function";
function Ds(n) {
  var t, s = function() {
    clearTimeout(a), Pn && cancelAnimationFrame(t), setTimeout(n);
  }, a = setTimeout(s, 35);
  Pn && (t = requestAnimationFrame(s));
}
function Ve(n) {
  var t = H, s = n.__c;
  typeof s == "function" && (n.__c = void 0, s()), H = t;
}
function Ot(n) {
  var t = H;
  n.__c = n.__(), H = t;
}
function Kn(n, t) {
  return !n || n.length !== t.length || t.some(function(s, a) {
    return s !== n[a];
  });
}
function Yn(n, t) {
  return typeof t == "function" ? t(n) : t;
}
var Hs = Symbol.for("preact-signals");
function ot() {
  if (ue > 1)
    ue--;
  else {
    for (var n, t = !1; Re !== void 0; ) {
      var s = Re;
      for (Re = void 0, At++; s !== void 0; ) {
        var a = s.o;
        if (s.o = void 0, s.f &= -3, !(8 & s.f) && er(s)) try {
          s.c();
        } catch (l) {
          t || (n = l, t = !0);
        }
        s = a;
      }
    }
    if (At = 0, ue--, t) throw n;
  }
}
function Ms(n) {
  if (ue > 0) return n();
  ue++;
  try {
    return n();
  } finally {
    ot();
  }
}
var L = void 0;
function Qn(n) {
  var t = L;
  L = void 0;
  try {
    return n();
  } finally {
    L = t;
  }
}
var Re = void 0, ue = 0, At = 0, Ze = 0;
function Zn(n) {
  if (L !== void 0) {
    var t = n.n;
    if (t === void 0 || t.t !== L)
      return t = { i: 0, S: n, p: L.s, n: void 0, t: L, e: void 0, x: void 0, r: t }, L.s !== void 0 && (L.s.n = t), L.s = t, n.n = t, 32 & L.f && n.S(t), t;
    if (t.i === -1)
      return t.i = 0, t.n !== void 0 && (t.n.p = t.p, t.p !== void 0 && (t.p.n = t.n), t.p = L.s, t.n = void 0, L.s.n = t, L.s = t), t;
  }
}
function J(n, t) {
  this.v = n, this.i = 0, this.n = void 0, this.t = void 0, this.W = t?.watched, this.Z = t?.unwatched, this.name = t?.name;
}
J.prototype.brand = Hs;
J.prototype.h = function() {
  return !0;
};
J.prototype.S = function(n) {
  var t = this, s = this.t;
  s !== n && n.e === void 0 && (n.x = s, this.t = n, s !== void 0 ? s.e = n : Qn(function() {
    var a;
    (a = t.W) == null || a.call(t);
  }));
};
J.prototype.U = function(n) {
  var t = this;
  if (this.t !== void 0) {
    var s = n.e, a = n.x;
    s !== void 0 && (s.x = a, n.e = void 0), a !== void 0 && (a.e = s, n.x = void 0), n === this.t && (this.t = a, a === void 0 && Qn(function() {
      var l;
      (l = t.Z) == null || l.call(t);
    }));
  }
};
J.prototype.subscribe = function(n) {
  var t = this;
  return Ue(function() {
    var s = t.value, a = L;
    L = void 0;
    try {
      n(s);
    } finally {
      L = a;
    }
  }, { name: "sub" });
};
J.prototype.valueOf = function() {
  return this.value;
};
J.prototype.toString = function() {
  return this.value + "";
};
J.prototype.toJSON = function() {
  return this.value;
};
J.prototype.peek = function() {
  var n = L;
  L = void 0;
  try {
    return this.value;
  } finally {
    L = n;
  }
};
Object.defineProperty(J.prototype, "value", { get: function() {
  var n = Zn(this);
  return n !== void 0 && (n.i = this.i), this.v;
}, set: function(n) {
  if (n !== this.v) {
    if (At > 100) throw new Error("Cycle detected");
    this.v = n, this.i++, Ze++, ue++;
    try {
      for (var t = this.t; t !== void 0; t = t.x) t.t.N();
    } finally {
      ot();
    }
  }
} });
function Z(n, t) {
  return new J(n, t);
}
function er(n) {
  for (var t = n.s; t !== void 0; t = t.n) if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
  return !1;
}
function tr(n) {
  for (var t = n.s; t !== void 0; t = t.n) {
    var s = t.S.n;
    if (s !== void 0 && (t.r = s), t.S.n = t, t.i = -1, t.n === void 0) {
      n.s = t;
      break;
    }
  }
}
function nr(n) {
  for (var t = n.s, s = void 0; t !== void 0; ) {
    var a = t.p;
    t.i === -1 ? (t.S.U(t), a !== void 0 && (a.n = t.n), t.n !== void 0 && (t.n.p = a)) : s = t, t.S.n = t.r, t.r !== void 0 && (t.r = void 0), t = a;
  }
  n.s = s;
}
function me(n, t) {
  J.call(this, void 0), this.x = n, this.s = void 0, this.g = Ze - 1, this.f = 4, this.W = t?.watched, this.Z = t?.unwatched, this.name = t?.name;
}
me.prototype = new J();
me.prototype.h = function() {
  if (this.f &= -3, 1 & this.f) return !1;
  if ((36 & this.f) == 32 || (this.f &= -5, this.g === Ze)) return !0;
  if (this.g = Ze, this.f |= 1, this.i > 0 && !er(this))
    return this.f &= -2, !0;
  var n = L;
  try {
    tr(this), L = this;
    var t = this.x();
    (16 & this.f || this.v !== t || this.i === 0) && (this.v = t, this.f &= -17, this.i++);
  } catch (s) {
    this.v = s, this.f |= 16, this.i++;
  }
  return L = n, nr(this), this.f &= -2, !0;
};
me.prototype.S = function(n) {
  if (this.t === void 0) {
    this.f |= 36;
    for (var t = this.s; t !== void 0; t = t.n) t.S.S(t);
  }
  J.prototype.S.call(this, n);
};
me.prototype.U = function(n) {
  if (this.t !== void 0 && (J.prototype.U.call(this, n), this.t === void 0)) {
    this.f &= -33;
    for (var t = this.s; t !== void 0; t = t.n) t.S.U(t);
  }
};
me.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 6;
    for (var n = this.t; n !== void 0; n = n.x) n.t.N();
  }
};
Object.defineProperty(me.prototype, "value", { get: function() {
  if (1 & this.f) throw new Error("Cycle detected");
  var n = Zn(this);
  if (this.h(), n !== void 0 && (n.i = this.i), 16 & this.f) throw this.v;
  return this.v;
} });
function et(n, t) {
  return new me(n, t);
}
function rr(n) {
  var t = n.u;
  if (n.u = void 0, typeof t == "function") {
    ue++;
    var s = L;
    L = void 0;
    try {
      t();
    } catch (a) {
      throw n.f &= -2, n.f |= 8, zt(n), a;
    } finally {
      L = s, ot();
    }
  }
}
function zt(n) {
  for (var t = n.s; t !== void 0; t = t.n) t.S.U(t);
  n.x = void 0, n.s = void 0, rr(n);
}
function js(n) {
  if (L !== this) throw new Error("Out-of-order effect");
  nr(this), L = n, this.f &= -2, 8 & this.f && zt(this), ot();
}
function ke(n, t) {
  this.x = n, this.u = void 0, this.s = void 0, this.o = void 0, this.f = 32, this.name = t?.name;
}
ke.prototype.c = function() {
  var n = this.S();
  try {
    if (8 & this.f || this.x === void 0) return;
    var t = this.x();
    typeof t == "function" && (this.u = t);
  } finally {
    n();
  }
};
ke.prototype.S = function() {
  if (1 & this.f) throw new Error("Cycle detected");
  this.f |= 1, this.f &= -9, rr(this), tr(this), ue++;
  var n = L;
  return L = this, js.bind(this, n);
};
ke.prototype.N = function() {
  2 & this.f || (this.f |= 2, this.o = Re, Re = this);
};
ke.prototype.d = function() {
  this.f |= 8, 1 & this.f || zt(this);
};
ke.prototype.dispose = function() {
  this.d();
};
function Ue(n, t) {
  var s = new ke(n, t);
  try {
    s.c();
  } catch (l) {
    throw s.d(), l;
  }
  var a = s.d.bind(s);
  return a[Symbol.dispose] = a, a;
}
var ir, We, zs = typeof window < "u" && !!window.__PREACT_SIGNALS_DEVTOOLS__, sr = [];
Ue(function() {
  ir = this.N;
})();
function Ce(n, t) {
  R[n] = t.bind(null, R[n] || function() {
  });
}
function tt(n) {
  if (We) {
    var t = We;
    We = void 0, t();
  }
  We = n && n.S();
}
function or(n) {
  var t = this, s = n.data, a = ar(s);
  a.value = s;
  var l = jt(function() {
    for (var f = t, _ = t.__v; _ = _.__; ) if (_.__c) {
      _.__c.__$f |= 4;
      break;
    }
    var v = et(function() {
      var b = a.value.value;
      return b === 0 ? 0 : b === !0 ? "" : b || "";
    }), y = et(function() {
      return !Array.isArray(v.value) && !Dn(v.value);
    }), d = Ue(function() {
      if (this.N = cr, y.value) {
        var b = v.value;
        f.__v && f.__v.__e && f.__v.__e.nodeType === 3 && (f.__v.__e.data = b);
      }
    }), S = t.__$u.d;
    return t.__$u.d = function() {
      d(), S.call(this);
    }, [y, v];
  }, []), u = l[0], h = l[1];
  return u.value ? h.peek() : h.value;
}
or.displayName = "ReactiveTextNode";
Object.defineProperties(J.prototype, { constructor: { configurable: !0, value: void 0 }, type: { configurable: !0, value: or }, props: { configurable: !0, get: function() {
  return { data: this };
} }, __b: { configurable: !0, value: 1 } });
Ce("__b", function(n, t) {
  if (typeof t.type == "string") {
    var s, a = t.props;
    for (var l in a) if (l !== "children") {
      var u = a[l];
      u instanceof J && (s || (t.__np = s = {}), s[l] = u, a[l] = u.peek());
    }
  }
  n(t);
});
Ce("__r", function(n, t) {
  if (n(t), t.type !== le) {
    tt();
    var s, a = t.__c;
    a && (a.__$f &= -2, (s = a.__$u) === void 0 && (a.__$u = s = (function(l, u) {
      var h;
      return Ue(function() {
        h = this;
      }, { name: u }), h.c = l, h;
    })(function() {
      var l;
      zs && ((l = s.y) == null || l.call(s)), a.__$f |= 1, a.setState({});
    }, typeof t.type == "function" ? t.type.displayName || t.type.name : ""))), tt(s);
  }
});
Ce("__e", function(n, t, s, a) {
  tt(), n(t, s, a);
});
Ce("diffed", function(n, t) {
  tt();
  var s;
  if (typeof t.type == "string" && (s = t.__e)) {
    var a = t.__np, l = t.props;
    if (a) {
      var u = s.U;
      if (u) for (var h in u) {
        var f = u[h];
        f !== void 0 && !(h in a) && (f.d(), u[h] = void 0);
      }
      else
        u = {}, s.U = u;
      for (var _ in a) {
        var v = u[_], y = a[_];
        v === void 0 ? (v = qs(s, _, y), u[_] = v) : v.o(y, l);
      }
      for (var d in a) l[d] = a[d];
    }
  }
  n(t);
});
function qs(n, t, s, a) {
  var l = t in n && n.ownerSVGElement === void 0, u = Z(s), h = s.peek();
  return { o: function(f, _) {
    u.value = f, h = f.peek();
  }, d: Ue(function() {
    this.N = cr;
    var f = u.value.value;
    h !== f ? (h = void 0, l ? n[t] = f : f != null && (f !== !1 || t[4] === "-") ? n.setAttribute(t, f) : n.removeAttribute(t)) : h = void 0;
  }) };
}
Ce("unmount", function(n, t) {
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
      var f = h.__$u;
      f && (h.__$u = void 0, f.d());
    }
  }
  n(t);
});
Ce("__h", function(n, t, s, a) {
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
  for (var f in this.props) if (!(f in n)) return !0;
  return !1;
};
function ar(n, t) {
  return jt(function() {
    return Z(n, t);
  }, []);
}
var Bs = function(n) {
  queueMicrotask(function() {
    queueMicrotask(n);
  });
};
function Fs() {
  Ms(function() {
    for (var n; n = sr.shift(); ) ir.call(n);
  });
}
function cr() {
  sr.push(this) === 1 && (R.requestAnimationFrame || Bs)(Fs);
}
const ee = Z(!1), nt = Z(!1), W = Z([]), q = Z(null), ge = Z(null), re = Z(null), he = Z(null), Ae = Z(""), Ne = Z(!1), rt = Z(!1), F = Z({
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
}), ur = Z(!1), Ws = et(
  () => F.value.requireEmail && !he.value && !q.value
), Js = et(() => !!q.value), lr = "guddesk_state";
function It() {
  try {
    localStorage.setItem(
      lr,
      JSON.stringify({
        conversationId: q.value,
        visitorId: ge.value,
        visitorToken: re.value,
        visitorEmail: he.value
      })
    );
  } catch {
  }
}
function Xs() {
  try {
    const n = localStorage.getItem(lr);
    if (!n) return;
    const t = JSON.parse(n);
    t.conversationId && (q.value = t.conversationId), t.visitorId && (ge.value = t.visitorId), t.visitorToken && (re.value = t.visitorToken), t.visitorEmail && (he.value = t.visitorEmail);
  } catch {
  }
}
function Vs(n, t, s) {
  return {
    appId: n,
    visitorToken: t,
    externalId: s.userId,
    name: s.name,
    email: s.email,
    metadata: s.metadata,
    userHash: s.userHash
  };
}
class hr extends Error {
  constructor(t, s, a) {
    super(t), this.status = s, this.code = a, this.name = "WidgetRequestError";
  }
}
const Gs = "VISITOR_NOT_FOUND";
function Ks(n) {
  return n instanceof hr && n.status === 401 && n.code === Gs;
}
async function Ys(n, t) {
  try {
    return await n();
  } catch (s) {
    if (!Ks(s) || !t.has()) throw s;
    return t.drop(), n();
  }
}
function Qs(n) {
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
function Zs(n) {
  const t = { ...n.extra };
  return n.hasBody && (t["Content-Type"] = "application/json"), n.visitorToken && (t["x-visitor-token"] = n.visitorToken), t;
}
let at = "", dr = "";
function eo(n, t) {
  at = n, dr = t.replace(/\/$/, "");
}
async function De(n, t = {}) {
  const s = Zs({
    hasBody: !!t.body,
    visitorToken: re.value,
    extra: t.headers
  }), a = await fetch(`${dr}${n}`, { ...t, headers: s });
  if (!a.ok) {
    const l = await a.json().catch(() => ({ error: "Request failed" }));
    throw new hr(l.error || "Request failed", a.status, l.code);
  }
  return a.json();
}
async function to() {
  const n = await De(
    `/api/widget/config?appId=${encodeURIComponent(at)}`
  );
  F.value = n, ur.value = !0;
}
async function ct(n) {
  const t = await De(
    "/api/widget/visitors",
    {
      method: "POST",
      body: JSON.stringify(
        Vs(at, re.value, n)
      )
    }
  );
  ge.value = t.visitorId, re.value = t.visitorToken, n.email && (he.value = n.email), It();
}
let no = 0;
function fr(n) {
  const t = `_opt_${++no}`, s = {
    id: t,
    body: n,
    type: "VISITOR",
    senderName: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    _sending: !0
  };
  return W.value = [...W.value, s], t;
}
function Lt(n, t) {
  t ? W.value = W.value.map((s) => s.id === n ? t : s) : W.value = W.value.map(
    (s) => s.id === n ? { ...s, _sending: !1 } : s
  );
}
async function ro(n) {
  return De("/api/widget/conversations", {
    method: "POST",
    body: JSON.stringify({
      appId: at,
      visitorToken: re.value,
      message: n,
      visitorName: null,
      visitorEmail: he.value
    })
  });
}
async function io(n) {
  const t = fr(n);
  nt.value = !0;
  try {
    const s = await Ys(() => ro(n), {
      has: () => !!re.value,
      drop: () => {
        re.value = null, ge.value = null, It();
      }
    });
    q.value = s.conversationId, ge.value = s.visitorId, re.value = s.visitorToken, W.value = [
      ...s.messages,
      ...W.value.filter((a) => a._sending && a.id !== t)
    ], It();
  } catch {
    Lt(t, null);
  } finally {
    nt.value = !1;
  }
}
async function so(n) {
  const t = fr(n);
  try {
    const s = await De(
      `/api/widget/conversations/${q.value}/messages`,
      { method: "POST", body: JSON.stringify({ message: n }) }
    );
    Lt(t, s);
  } catch {
    Lt(t, null);
  }
}
const oo = Qs({
  hasConversation: () => !!q.value,
  start: io,
  post: so
});
function ao(n) {
  return oo.send(n);
}
async function xt() {
  if (!q.value) return;
  const n = await De(
    `/api/widget/conversations/${q.value}/messages`
  );
  W.value = n.messages;
}
const co = "https://www.guddesk.com", uo = /* @__PURE__ */ new Set([
  "cdn.guddesk.com",
  "www.guddesk.com",
  "guddesk.com"
]);
function lo(n, t, s) {
  if (s)
    return s.replace(/\/$/, "");
  if (n)
    try {
      const a = new URL(n);
      if (uo.has(a.hostname))
        return co;
      if (a.hostname.includes("guddesk") || n.includes("widget"))
        return a.origin;
    } catch {
    }
  return t;
}
function ho(n) {
  for (let t = n.length - 1; t >= 0; t--) {
    const s = n[t]?.src;
    if (s && (s.includes("guddesk") || s.includes("widget")))
      return s;
  }
}
function fo(n) {
  return !n.defaultPrevented || n.ctrlKey || n.metaKey || n.altKey || n.isComposing || n.key.length !== 1 ? null : n.key;
}
function po(n, t) {
  const s = n.selectionStart ?? n.value.length, a = n.selectionEnd ?? s;
  n.value = n.value.slice(0, s) + t + n.value.slice(a);
  const l = s + t.length;
  try {
    n.setSelectionRange(l, l);
  } catch {
  }
  n.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function _o(n) {
  return n instanceof HTMLInputElement || n instanceof HTMLTextAreaElement;
}
const En = ["keydown", "keyup", "keypress"];
function vo(n) {
  const t = (a) => {
    const l = a, u = fo(l);
    !u || !_o(l.target) || po(l.target, u);
  }, s = (a) => {
    a.stopPropagation();
  };
  n.addEventListener("keydown", t, !0);
  for (const a of En)
    n.addEventListener(a, s);
  return () => {
    n.removeEventListener("keydown", t, !0);
    for (const a of En)
      n.removeEventListener(a, s);
  };
}
const On = "#3ECF8E", go = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Je = String.raw`(?:\d+(?:\.\d+)?|\.\d+)%?`, mo = new RegExp(
  String.raw`^rgba?\(\s*${Je}\s*,\s*${Je}\s*,\s*${Je}\s*(?:,\s*${Je}\s*)?\)$`,
  "i"
);
function An(n) {
  if (typeof n != "string") return !1;
  const t = n.trim();
  return go.test(t) || mo.test(t);
}
function Rt(n, t = On) {
  return An(n) ? n.trim() : An(t) ? t.trim() : On;
}
const bo = 440;
function In(n) {
  if (n == null || n === "") return;
  const t = n.trim().toLowerCase();
  if (t === "true" || t === "1") return !0;
  if (t === "false" || t === "0") return !1;
}
function yo(n) {
  const t = {}, s = n.getAttribute("data-app-id") || n.getAttribute("data-guddesk") || void 0;
  s && (t.appId = s);
  const a = n.getAttribute("data-base-url");
  a && (t.baseUrl = a);
  const l = In(n.getAttribute("data-open-on-load"));
  l !== void 0 && (t.openOnLoad = l);
  const u = In(n.getAttribute("data-hide-on-mobile"));
  u !== void 0 && (t.hideOnMobile = u);
  const h = n.getAttribute("data-name");
  h && (t.name = h);
  const f = n.getAttribute("data-email");
  f && (t.email = f);
  const _ = n.getAttribute("data-accent-color");
  _ && (t.accentColor = _);
  const v = n.getAttribute("data-position");
  return v && (t.position = v), n.hasAttribute?.("data-greeting") && (t.greeting = n.getAttribute("data-greeting") ?? ""), t;
}
function wo(n, t) {
  return { ...n, ...t };
}
function So(n, t) {
  return {
    primaryColor: Rt(
      t.accentColor,
      Rt(n.primaryColor)
    ),
    position: t.position ?? n.position,
    welcomeMessage: t.greeting !== void 0 ? t.greeting : n.welcomeMessage
  };
}
function xo(n, t, s = bo) {
  return !!n && t <= s;
}
function ko(n) {
  for (let t = n.length - 1; t >= 0; t--) {
    const s = n[t];
    if (s && (s.getAttribute("data-app-id") || s.getAttribute("data-guddesk") || s.src && (s.src.includes("widget.js") || s.src.includes("guddesk"))))
      return s;
  }
}
var Co = 0;
function k(n, t, s, a, l, u) {
  t || (t = {});
  var h, f, _ = t;
  if ("ref" in _) for (f in _ = {}, t) f == "ref" ? h = t[f] : _[f] = t[f];
  var v = { type: n, props: _, key: s, ref: h, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --Co, __i: -1, __u: 0, __source: l, __self: u };
  if (typeof n == "function" && (h = n.defaultProps)) for (f in h) _[f] === void 0 && (_[f] = h[f]);
  return R.vnode && R.vnode(v), v;
}
function To(n) {
  const t = n.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/\*\*/g, "{{GLOBSTAR}}").replace(/\*/g, "[^/]*").replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${t}$`);
}
function Po(n, t, s) {
  if (!s || s.length === 0) return !0;
  const a = s.some((l) => {
    try {
      return To(l).test(n);
    } catch {
      return !1;
    }
  });
  return t === "exclude" ? !a : a;
}
let ne = null, te = null, ye = null;
const Eo = 8e3;
async function Oo(n, t, s) {
  const { default: a } = await Promise.resolve().then(() => ta), l = new a(n, {
    cluster: t,
    channelAuthorization: {
      endpoint: s,
      transport: "ajax",
      customHandler: ({ channelName: u, socketId: h }, f) => {
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
            f(
              new Error(`Pusher auth failed: ${_.status}`),
              null
            );
            return;
          }
          const v = await _.json();
          f(null, v);
        }).catch((_) => f(_, null));
      }
    }
  });
  return await new Promise((u, h) => {
    const f = setTimeout(() => {
      _();
      try {
        l.disconnect();
      } catch {
      }
      h(new Error("Pusher connection timeout"));
    }, Eo);
    function _() {
      clearTimeout(f), l.connection.unbind("connected", v), l.connection.unbind("error", y), l.connection.unbind("unavailable", y), l.connection.unbind("failed", y);
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
  }), ne = l, ne;
}
function Ln() {
  if (!ne || !q.value) return;
  te && (te.unbind_all(), ne.unsubscribe(te.name));
  const n = `private-visitor-${q.value}`;
  te = ne.subscribe(n), te.bind("message:created", (t) => {
    W.value.some((s) => s.id === t.id) || (W.value = [...W.value, t]);
  }), te.bind("typing:start", () => {
    Ne.value = !0, ye && clearTimeout(ye), ye = setTimeout(() => {
      Ne.value = !1;
    }, 4e3);
  }), te.bind("typing:stop", () => {
    Ne.value = !1, ye && (clearTimeout(ye), ye = null);
  });
}
function kt() {
  return ne?.connection?.state === "connected";
}
function Ao() {
  te && (te.unbind_all(), ne?.unsubscribe(te.name), te = null), ne && (ne.disconnect(), ne = null);
}
const Io = "guddesk_identified:";
function pr(n) {
  return `${Io}${n}`;
}
function _r(n) {
  return JSON.stringify([
    n.visitorId ?? "",
    n.userId ?? "",
    n.name ?? "",
    n.email ?? ""
  ]);
}
function Lo(n, t, s) {
  if (!n) return !0;
  try {
    return n.getItem(pr(t)) !== _r(s);
  } catch {
    return !0;
  }
}
function Ro(n, t, s) {
  if (n)
    try {
      n.setItem(pr(t), _r(s));
    } catch {
    }
}
function No() {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
}
function $o(n, t) {
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
const Uo = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', Do = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', Ho = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function Mo() {
  return /* @__PURE__ */ k("div", { class: "fc-header", style: { position: "relative" }, children: [
    /* @__PURE__ */ k("div", { class: "fc-header-title", children: F.value.workspaceName || "Support" }),
    /* @__PURE__ */ k("div", { class: "fc-header-subtitle", children: "We typically reply in a few minutes" }),
    /* @__PURE__ */ k(
      "button",
      {
        class: "fc-header-close",
        onClick: () => ee.value = !1,
        "aria-label": "Close chat",
        dangerouslySetInnerHTML: { __html: Do }
      }
    )
  ] });
}
function jo(n) {
  try {
    return new Date(n).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function Rn() {
  const n = we(null);
  return Ie(() => {
    n.current?.scrollIntoView({ behavior: "smooth" });
  }, [W.value.length, Ne.value]), Js.value ? /* @__PURE__ */ k("div", { class: "fc-messages", children: [
    W.value.map((t) => /* @__PURE__ */ k(
      "div",
      {
        class: `fc-msg-row ${t.type === "VISITOR" ? "fc-msg-row-visitor" : "fc-msg-row-agent"}`,
        children: [
          t.type !== "VISITOR" && t.senderName && /* @__PURE__ */ k("div", { class: "fc-msg-sender", children: t.senderName }),
          /* @__PURE__ */ k(
            "div",
            {
              class: `fc-msg ${t.type === "VISITOR" ? "fc-msg-visitor" : "fc-msg-agent"}${t._sending ? " fc-msg-sending" : ""}`,
              children: [
                t.body,
                /* @__PURE__ */ k("div", { class: "fc-msg-time", children: t._sending ? /* @__PURE__ */ k("span", { class: "fc-sending-indicator", children: [
                  /* @__PURE__ */ k("span", { class: "fc-sending-dot" }),
                  /* @__PURE__ */ k("span", { class: "fc-sending-dot" }),
                  /* @__PURE__ */ k("span", { class: "fc-sending-dot" })
                ] }) : jo(t.createdAt) })
              ]
            }
          )
        ]
      },
      t.id
    )),
    Ne.value && /* @__PURE__ */ k("div", { class: "fc-typing", children: /* @__PURE__ */ k("span", { class: "fc-typing-dots", children: [
      /* @__PURE__ */ k("span", { children: "." }),
      /* @__PURE__ */ k("span", { children: "." }),
      /* @__PURE__ */ k("span", { children: "." })
    ] }) }),
    /* @__PURE__ */ k("div", { ref: n })
  ] }) : /* @__PURE__ */ k("div", { class: "fc-messages", children: /* @__PURE__ */ k("div", { class: "fc-msg fc-msg-agent", children: F.value.welcomeMessage }) });
}
function zo() {
  const n = we(null);
  async function t() {
    const a = Ae.value.trim();
    !a || nt.value || (Ae.value = "", await ao(a), n.current?.focus());
  }
  function s(a) {
    a.key === "Enter" && !a.shiftKey && (a.preventDefault(), t());
  }
  return /* @__PURE__ */ k("div", { class: "fc-input-area", children: [
    /* @__PURE__ */ k(
      "textarea",
      {
        ref: n,
        class: "fc-input",
        rows: 1,
        placeholder: "Type a message...",
        value: Ae.value,
        onInput: (a) => {
          Ae.value = a.target.value;
        },
        onKeyDown: s
      }
    ),
    /* @__PURE__ */ k(
      "button",
      {
        class: "fc-send-btn",
        onClick: t,
        disabled: !Ae.value.trim() || nt.value,
        children: "Send"
      }
    )
  ] });
}
function qo() {
  const [n, t] = ae(""), [s, a] = ae(""), [l, u] = ae(!1);
  async function h(f) {
    f.preventDefault();
    const _ = n.trim();
    if (!_ || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_)) {
      a("Please enter a valid email address.");
      return;
    }
    u(!0), a("");
    try {
      await ct({ email: _ }), he.value = _;
    } catch {
      a("Something went wrong. Please try again.");
    } finally {
      u(!1);
    }
  }
  return /* @__PURE__ */ k("form", { class: "fc-prechat", onSubmit: h, children: [
    /* @__PURE__ */ k("label", { children: "Enter your email to start chatting" }),
    /* @__PURE__ */ k(
      "input",
      {
        type: "email",
        placeholder: "you@example.com",
        value: n,
        onInput: (f) => t(f.target.value),
        required: !0
      }
    ),
    s && /* @__PURE__ */ k("div", { style: { color: "#ef4444", fontSize: "12px" }, children: s }),
    /* @__PURE__ */ k("button", { type: "submit", disabled: l, children: l ? "..." : "Start Chat" })
  ] });
}
function Bo() {
  const [n, t] = ae(""), [s, a] = ae(he.value ?? ""), [l, u] = ae(""), [h, f] = ae(!1), [_, v] = ae(!1), [y, d] = ae("");
  async function S(T) {
    T.preventDefault();
    const C = s.trim();
    if (!C || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(C)) {
      d("Please enter a valid email address.");
      return;
    }
    v(!0), d("");
    try {
      await ct({
        email: C,
        name: n.trim() || void 0
      }), he.value = C, f(!0);
    } catch {
      d("Something went wrong. Please try again.");
    } finally {
      v(!1);
    }
  }
  function b() {
    rt.value = !1;
  }
  return h ? /* @__PURE__ */ k("div", { class: "fc-offline-form", children: /* @__PURE__ */ k("div", { class: "fc-offline-success", children: [
    /* @__PURE__ */ k("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: F.value.primaryColor, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ k("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
      /* @__PURE__ */ k("polyline", { points: "22 4 12 14.01 9 11.01" })
    ] }),
    /* @__PURE__ */ k("p", { class: "fc-offline-success-title", children: "Thanks! We'll be in touch." }),
    /* @__PURE__ */ k("p", { class: "fc-offline-success-text", children: [
      "We'll get back to you at ",
      /* @__PURE__ */ k("strong", { children: s }),
      " as soon as possible."
    ] }),
    /* @__PURE__ */ k("button", { class: "fc-offline-dismiss", onClick: b, children: "Continue chatting" })
  ] }) }) : /* @__PURE__ */ k("div", { class: "fc-offline-form", children: [
    /* @__PURE__ */ k("div", { class: "fc-offline-header", children: [
      /* @__PURE__ */ k("p", { class: "fc-offline-title", children: "We're not available right now" }),
      /* @__PURE__ */ k("p", { class: "fc-offline-subtitle", children: "Leave your details and we'll get back to you." })
    ] }),
    /* @__PURE__ */ k("form", { class: "fc-offline-fields", onSubmit: S, children: [
      /* @__PURE__ */ k("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ k("label", { children: "Name" }),
        /* @__PURE__ */ k(
          "input",
          {
            type: "text",
            placeholder: "Your name",
            value: n,
            onInput: (T) => t(T.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ k("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ k("label", { children: "Email *" }),
        /* @__PURE__ */ k(
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
      /* @__PURE__ */ k("div", { class: "fc-offline-field", children: [
        /* @__PURE__ */ k("label", { children: "Message" }),
        /* @__PURE__ */ k(
          "textarea",
          {
            placeholder: "Anything else you'd like us to know?",
            rows: 3,
            value: l,
            onInput: (T) => u(T.target.value)
          }
        )
      ] }),
      y && /* @__PURE__ */ k("div", { class: "fc-offline-error", children: y }),
      /* @__PURE__ */ k("button", { type: "submit", class: "fc-offline-submit", disabled: _, children: _ ? "Sending..." : "Leave a message" }),
      /* @__PURE__ */ k("button", { type: "button", class: "fc-offline-dismiss", onClick: b, children: "Continue chatting" })
    ] })
  ] });
}
function Fo() {
  return /* @__PURE__ */ k("div", { class: "fc-window", children: [
    /* @__PURE__ */ k(Mo, {}),
    Ws.value ? /* @__PURE__ */ k(qo, {}) : rt.value ? /* @__PURE__ */ k(le, { children: [
      /* @__PURE__ */ k(Rn, {}),
      /* @__PURE__ */ k(Bo, {})
    ] }) : /* @__PURE__ */ k(le, { children: [
      /* @__PURE__ */ k(Rn, {}),
      /* @__PURE__ */ k(zo, {})
    ] }),
    F.value.showBranding && /* @__PURE__ */ k("div", { class: "fc-branding", children: [
      "Powered by",
      " ",
      /* @__PURE__ */ k("a", { href: "https://guddesk.com", target: "_blank", rel: "noopener", children: "GudDesk" })
    ] })
  ] });
}
function Wo() {
  return /* @__PURE__ */ k(
    "button",
    {
      class: "fc-bubble",
      onClick: () => ee.value = !ee.value,
      "aria-label": ee.value ? "Close chat" : "Open chat",
      dangerouslySetInnerHTML: {
        __html: ee.value ? Ho : Uo
      }
    }
  );
}
const Jo = 4e3;
function Xo({
  appId: n,
  baseUrl: t,
  pusherKey: s,
  pusherCluster: a,
  snippet: l = {}
}) {
  const u = we(null), h = we(!1), f = we(null), _ = we(0), v = ar(!1);
  function y() {
    d(), u.current = setInterval(() => {
      q.value && ee.value && xt().catch(() => {
      });
    }, Jo);
  }
  function d() {
    u.current && (clearInterval(u.current), u.current = null);
  }
  async function S(b, T) {
    if (!h.current) {
      h.current = !0;
      try {
        await Oo(b, T, `${t}/api/pusher/auth`), q.value && Ln(), d();
      } catch {
        h.current = !1, y();
      }
    }
  }
  return Ie(() => (Xs(), eo(n, t), to().catch(() => {
  }).then(() => {
    const b = So(F.value, l);
    if (F.value = { ...F.value, ...b }, !Po(
      window.location.pathname,
      F.value.pageVisibilityMode,
      F.value.pageVisibilityPatterns
    ) || xo(l.hideOnMobile, window.innerWidth)) {
      v.value = !0;
      return;
    }
    if (l.openOnLoad && (ee.value = !0), l.name || l.email) {
      const m = No(), x = { name: l.name, email: l.email };
      Lo(m, n, {
        ...x,
        visitorId: ge.value
      }) && ct(x).then(() => {
        Ro(m, n, {
          ...x,
          visitorId: ge.value
        });
      }).catch(() => {
      });
    }
    q.value && xt().catch(() => {
    });
    const C = s || F.value.pusherKey, g = a || F.value.pusherCluster;
    C && g ? S(C, g) : y();
  }), () => {
    Ao(), d();
  }), []), Ie(() => {
    q.value && (kt() ? Ln() : u.current || y());
  }, [q.value]), Ie(() => {
    ee.value && q.value && !kt() ? (xt().catch(() => {
    }), y()) : !ee.value && !kt() && d();
  }, [ee.value]), Ie(() => {
    const b = F.value.offlineFormTimeout;
    if (!b || !q.value) return;
    const T = W.value, C = T.filter((m) => m.type === "VISITOR").length;
    if (T.some((m) => m.type === "AGENT" || m.type === "BOT")) {
      rt.value = !1, f.current && (clearTimeout(f.current), f.current = null), _.current = C;
      return;
    }
    return C > _.current && (_.current = C, f.current && clearTimeout(f.current), f.current = setTimeout(() => {
      W.value.some((A) => A.type === "AGENT" || A.type === "BOT") || (rt.value = !0);
    }, b * 60 * 1e3)), () => {
      f.current && (clearTimeout(f.current), f.current = null);
    };
  }, [W.value, q.value, F.value.offlineFormTimeout]), !ur.value || v.value ? null : /* @__PURE__ */ k(le, { children: [
    /* @__PURE__ */ k("style", { children: $o(Rt(F.value.primaryColor), F.value.position) }),
    /* @__PURE__ */ k("div", { class: "fc-container", children: [
      ee.value && /* @__PURE__ */ k(Fo, {}),
      /* @__PURE__ */ k(Wo, {})
    ] })
  ] });
}
let Se = null, Nt = null;
function Vo(n) {
  const t = Array.from(document.querySelectorAll("script[src]")).map(
    (s) => ({ src: s.src })
  );
  return lo(
    ho(t),
    window.location.origin,
    n
  );
}
function Go() {
  const n = Array.from(document.querySelectorAll("script")), t = ko(
    n.map((l) => l)
  ), s = t ? yo(t) : {}, a = wo(s, window.GudDeskSettings);
  return a.appId ? a : null;
}
function vr(n) {
  if (Se) return;
  const t = n.appId;
  if (!t) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }
  const s = Vo(n.baseUrl), a = document.createElement("div");
  a.id = "guddesk-widget", document.body.appendChild(a), Se = a.attachShadow({ mode: "open" }), Nt = vo(Se), Vn(
    zn(Xo, {
      appId: t,
      baseUrl: s,
      pusherKey: n.pusherKey,
      pusherCluster: n.pusherCluster,
      snippet: n
    }),
    Se
  );
}
function Ko() {
  const n = document.getElementById("guddesk-widget");
  n && (Nt?.(), Nt = null, Vn(null, Se), n.remove(), Se = null);
}
function Nn() {
  const n = Go();
  n && vr(n);
}
const Yo = {
  init: vr,
  identify: (n) => ct(n),
  open: () => {
    ee.value = !0;
  },
  close: () => {
    ee.value = !1;
  },
  destroy: Ko
};
window.GudDesk = Yo;
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Nn) : Nn();
function Qo(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var Ct = { exports: {} };
/*!
 * Pusher JavaScript Library v8.4.0
 * https://pusher.com/
 *
 * Copyright 2020, Pusher
 * Released under the MIT licence.
 */
var $n;
function Zo() {
  return $n || ($n = 1, (function(n, t) {
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
          return l.m = s, l.c = a, l.d = function(u, h, f) {
            l.o(u, h) || Object.defineProperty(u, h, { enumerable: !0, get: f });
          }, l.r = function(u) {
            typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(u, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(u, "__esModule", { value: !0 });
          }, l.t = function(u, h) {
            if (h & 1 && (u = l(u)), h & 8 || h & 4 && typeof u == "object" && u && u.__esModule) return u;
            var f = /* @__PURE__ */ Object.create(null);
            if (l.r(f), Object.defineProperty(f, "default", { enumerable: !0, value: u }), h & 2 && typeof u != "string") for (var _ in u) l.d(f, _, function(v) {
              return u[v];
            }.bind(null, _));
            return f;
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
              var C = function(g, m) {
                return C = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(x, A) {
                  x.__proto__ = A;
                } || function(x, A) {
                  for (var $ in A) A.hasOwnProperty($) && (x[$] = A[$]);
                }, C(g, m);
              };
              return function(g, m) {
                C(g, m);
                function x() {
                  this.constructor = g;
                }
                g.prototype = m === null ? Object.create(m) : (x.prototype = m.prototype, new x());
              };
            })();
            Object.defineProperty(a, "__esModule", { value: !0 });
            var h = 256, f = (
              /** @class */
              (function() {
                function C(g) {
                  g === void 0 && (g = "="), this._paddingCharacter = g;
                }
                return C.prototype.encodedLength = function(g) {
                  return this._paddingCharacter ? (g + 2) / 3 * 4 | 0 : (g * 8 + 5) / 6 | 0;
                }, C.prototype.encode = function(g) {
                  for (var m = "", x = 0; x < g.length - 2; x += 3) {
                    var A = g[x] << 16 | g[x + 1] << 8 | g[x + 2];
                    m += this._encodeByte(A >>> 18 & 63), m += this._encodeByte(A >>> 12 & 63), m += this._encodeByte(A >>> 6 & 63), m += this._encodeByte(A >>> 0 & 63);
                  }
                  var $ = g.length - x;
                  if ($ > 0) {
                    var A = g[x] << 16 | ($ === 2 ? g[x + 1] << 8 : 0);
                    m += this._encodeByte(A >>> 18 & 63), m += this._encodeByte(A >>> 12 & 63), $ === 2 ? m += this._encodeByte(A >>> 6 & 63) : m += this._paddingCharacter || "", m += this._paddingCharacter || "";
                  }
                  return m;
                }, C.prototype.maxDecodedLength = function(g) {
                  return this._paddingCharacter ? g / 4 * 3 | 0 : (g * 6 + 7) / 8 | 0;
                }, C.prototype.decodedLength = function(g) {
                  return this.maxDecodedLength(g.length - this._getPaddingLength(g));
                }, C.prototype.decode = function(g) {
                  if (g.length === 0)
                    return new Uint8Array(0);
                  for (var m = this._getPaddingLength(g), x = g.length - m, A = new Uint8Array(this.maxDecodedLength(x)), $ = 0, D = 0, K = 0, Y = 0, X = 0, M = 0, G = 0; D < x - 4; D += 4)
                    Y = this._decodeChar(g.charCodeAt(D + 0)), X = this._decodeChar(g.charCodeAt(D + 1)), M = this._decodeChar(g.charCodeAt(D + 2)), G = this._decodeChar(g.charCodeAt(D + 3)), A[$++] = Y << 2 | X >>> 4, A[$++] = X << 4 | M >>> 2, A[$++] = M << 6 | G, K |= Y & h, K |= X & h, K |= M & h, K |= G & h;
                  if (D < x - 1 && (Y = this._decodeChar(g.charCodeAt(D)), X = this._decodeChar(g.charCodeAt(D + 1)), A[$++] = Y << 2 | X >>> 4, K |= Y & h, K |= X & h), D < x - 2 && (M = this._decodeChar(g.charCodeAt(D + 2)), A[$++] = X << 4 | M >>> 2, K |= M & h), D < x - 3 && (G = this._decodeChar(g.charCodeAt(D + 3)), A[$++] = M << 6 | G, K |= G & h), K !== 0)
                    throw new Error("Base64Coder: incorrect characters for decoding");
                  return A;
                }, C.prototype._encodeByte = function(g) {
                  var m = g;
                  return m += 65, m += 25 - g >>> 8 & 6, m += 51 - g >>> 8 & -75, m += 61 - g >>> 8 & -15, m += 62 - g >>> 8 & 3, String.fromCharCode(m);
                }, C.prototype._decodeChar = function(g) {
                  var m = h;
                  return m += (42 - g & g - 44) >>> 8 & -h + g - 43 + 62, m += (46 - g & g - 48) >>> 8 & -h + g - 47 + 63, m += (47 - g & g - 58) >>> 8 & -h + g - 48 + 52, m += (64 - g & g - 91) >>> 8 & -h + g - 65 + 0, m += (96 - g & g - 123) >>> 8 & -h + g - 97 + 26, m;
                }, C.prototype._getPaddingLength = function(g) {
                  var m = 0;
                  if (this._paddingCharacter) {
                    for (var x = g.length - 1; x >= 0 && g[x] === this._paddingCharacter; x--)
                      m++;
                    if (g.length < 4 || m > 2)
                      throw new Error("Base64Coder: incorrect padding");
                  }
                  return m;
                }, C;
              })()
            );
            a.Coder = f;
            var _ = new f();
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
                return g.prototype._encodeByte = function(m) {
                  var x = m;
                  return x += 65, x += 25 - m >>> 8 & 6, x += 51 - m >>> 8 & -75, x += 61 - m >>> 8 & -13, x += 62 - m >>> 8 & 49, String.fromCharCode(x);
                }, g.prototype._decodeChar = function(m) {
                  var x = h;
                  return x += (44 - m & m - 46) >>> 8 & -h + m - 45 + 62, x += (94 - m & m - 96) >>> 8 & -h + m - 95 + 63, x += (47 - m & m - 58) >>> 8 & -h + m - 48 + 52, x += (64 - m & m - 91) >>> 8 & -h + m - 65 + 0, x += (96 - m & m - 123) >>> 8 & -h + m - 97 + 26, x;
                }, g;
              })(f)
            );
            a.URLSafeCoder = d;
            var S = new d();
            function b(C) {
              return S.encode(C);
            }
            a.encodeURLSafe = b;
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
            function f(y) {
              for (var d = new Uint8Array(_(y)), S = 0, b = 0; b < y.length; b++) {
                var T = y.charCodeAt(b);
                T < 128 ? d[S++] = T : T < 2048 ? (d[S++] = 192 | T >> 6, d[S++] = 128 | T & 63) : T < 55296 ? (d[S++] = 224 | T >> 12, d[S++] = 128 | T >> 6 & 63, d[S++] = 128 | T & 63) : (b++, T = (T & 1023) << 10, T |= y.charCodeAt(b) & 1023, T += 65536, d[S++] = 240 | T >> 18, d[S++] = 128 | T >> 12 & 63, d[S++] = 128 | T >> 6 & 63, d[S++] = 128 | T & 63);
              }
              return d;
            }
            a.encode = f;
            function _(y) {
              for (var d = 0, S = 0; S < y.length; S++) {
                var b = y.charCodeAt(S);
                if (b < 128)
                  d += 1;
                else if (b < 2048)
                  d += 2;
                else if (b < 55296)
                  d += 3;
                else if (b <= 57343) {
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
                var b = y[S];
                if (b & 128) {
                  var T = void 0;
                  if (b < 224) {
                    if (S >= y.length)
                      throw new Error(h);
                    var C = y[++S];
                    if ((C & 192) !== 128)
                      throw new Error(h);
                    b = (b & 31) << 6 | C & 63, T = 128;
                  } else if (b < 240) {
                    if (S >= y.length - 1)
                      throw new Error(h);
                    var C = y[++S], g = y[++S];
                    if ((C & 192) !== 128 || (g & 192) !== 128)
                      throw new Error(h);
                    b = (b & 15) << 12 | (C & 63) << 6 | g & 63, T = 2048;
                  } else if (b < 248) {
                    if (S >= y.length - 2)
                      throw new Error(h);
                    var C = y[++S], g = y[++S], m = y[++S];
                    if ((C & 192) !== 128 || (g & 192) !== 128 || (m & 192) !== 128)
                      throw new Error(h);
                    b = (b & 15) << 18 | (C & 63) << 12 | (g & 63) << 6 | m & 63, T = 65536;
                  } else
                    throw new Error(h);
                  if (b < T || b >= 55296 && b <= 57343)
                    throw new Error(h);
                  if (b >= 65536) {
                    if (b > 1114111)
                      throw new Error(h);
                    b -= 65536, d.push(String.fromCharCode(55296 | b >> 10)), b = 56320 | b & 1023;
                  }
                }
                d.push(String.fromCharCode(b));
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
                var r = this.lastId, o = this.prefix + r, c = this.name + "[" + r + "]", p = !1, w = function() {
                  p || (e.apply(null, arguments), p = !0);
                };
                return this[r] = w, { number: r, id: o, name: c, callback: w };
              }
              remove(e) {
                delete this[e.number];
              }
            }
            var h = new u("_pusher_script_", "Pusher.ScriptReceivers"), f = {
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
            }, _ = f;
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
                  var p = O.createScriptRequest(c.getPath(e, r)), w = c.receivers.create(function(P) {
                    if (c.receivers.remove(w), c.loading[e]) {
                      var E = c.loading[e];
                      delete c.loading[e];
                      for (var I = function(j) {
                        j || p.cleanup();
                      }, N = 0; N < E.length; N++)
                        E[N](P, I);
                    }
                  });
                  p.send(w);
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
            class m extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class x extends Error {
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
            class K extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class Y extends Error {
              constructor(e) {
                super(e), Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            class X extends Error {
              constructor(e, r) {
                super(r), this.status = e, Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            var G = function(i, e, r, o, c) {
              const p = O.createXHR();
              p.open("POST", r.endpoint, !0), p.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
              for (var w in r.headers)
                p.setRequestHeader(w, r.headers[w]);
              if (r.headersProvider != null) {
                let P = r.headersProvider();
                for (var w in P)
                  p.setRequestHeader(w, P[w]);
              }
              return p.onreadystatechange = function() {
                if (p.readyState === 4)
                  if (p.status === 200) {
                    let P, E = !1;
                    try {
                      P = JSON.parse(p.responseText), E = !0;
                    } catch {
                      c(new X(200, `JSON returned from ${o.toString()} endpoint was invalid, yet status code was 200. Data was: ${p.responseText}`), null);
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
                    c(new X(p.status, `Unable to retrieve auth string from ${o.toString()} endpoint - received status: ${p.status} from ${r.endpoint}. ${P}`), null);
                  }
              }, p.send(e), p;
            };
            function mr(i) {
              return Sr(yr(i));
            }
            var Te = String.fromCharCode, He = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", br = function(i) {
              var e = i.charCodeAt(0);
              return e < 128 ? i : e < 2048 ? Te(192 | e >>> 6) + Te(128 | e & 63) : Te(224 | e >>> 12 & 15) + Te(128 | e >>> 6 & 63) + Te(128 | e & 63);
            }, yr = function(i) {
              return i.replace(/[^\x00-\x7F]/g, br);
            }, wr = function(i) {
              var e = [0, 2, 1][i.length % 3], r = i.charCodeAt(0) << 16 | (i.length > 1 ? i.charCodeAt(1) : 0) << 8 | (i.length > 2 ? i.charCodeAt(2) : 0), o = [
                He.charAt(r >>> 18),
                He.charAt(r >>> 12 & 63),
                e >= 2 ? "=" : He.charAt(r >>> 6 & 63),
                e >= 1 ? "=" : He.charAt(r & 63)
              ];
              return o.join("");
            }, Sr = window.btoa || function(i) {
              return i.replace(/[\s\S]{1,3}/g, wr);
            };
            class xr {
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
            var qt = xr;
            function kr(i) {
              window.clearTimeout(i);
            }
            function Cr(i) {
              window.clearInterval(i);
            }
            class de extends qt {
              constructor(e, r) {
                super(setTimeout, kr, e, function(o) {
                  return r(), null;
                });
              }
            }
            class Tr extends qt {
              constructor(e, r) {
                super(setInterval, Cr, e, function(o) {
                  return r(), o;
                });
              }
            }
            var Pr = {
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
            }, V = Pr;
            function Q(i, ...e) {
              for (var r = 0; r < e.length; r++) {
                var o = e[r];
                for (var c in o)
                  o[c] && o[c].constructor && o[c].constructor === Object ? i[c] = Q(i[c] || {}, o[c]) : i[c] = o[c];
              }
              return i;
            }
            function Er() {
              for (var i = ["Pusher"], e = 0; e < arguments.length; e++)
                typeof arguments[e] == "string" ? i.push(arguments[e]) : i.push(Me(arguments[e]));
              return i.join(" : ");
            }
            function Bt(i, e) {
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
            function Ft(i) {
              var e = [];
              return ie(i, function(r, o) {
                e.push(o);
              }), e;
            }
            function Or(i) {
              var e = [];
              return ie(i, function(r) {
                e.push(r);
              }), e;
            }
            function Pe(i, e, r) {
              for (var o = 0; o < i.length; o++)
                e.call(r || window, i[o], o, i);
            }
            function Wt(i, e) {
              for (var r = [], o = 0; o < i.length; o++)
                r.push(e(i[o], o, i, r));
              return r;
            }
            function Ar(i, e) {
              var r = {};
              return ie(i, function(o, c) {
                r[c] = e(o);
              }), r;
            }
            function Jt(i, e) {
              e = e || function(c) {
                return !!c;
              };
              for (var r = [], o = 0; o < i.length; o++)
                e(i[o], o, i, r) && r.push(i[o]);
              return r;
            }
            function Xt(i, e) {
              var r = {};
              return ie(i, function(o, c) {
                (e && e(o, c, i, r) || o) && (r[c] = o);
              }), r;
            }
            function Ir(i) {
              var e = [];
              return ie(i, function(r, o) {
                e.push([o, r]);
              }), e;
            }
            function Vt(i, e) {
              for (var r = 0; r < i.length; r++)
                if (e(i[r], r, i))
                  return !0;
              return !1;
            }
            function Lr(i, e) {
              for (var r = 0; r < i.length; r++)
                if (!e(i[r], r, i))
                  return !1;
              return !0;
            }
            function Rr(i) {
              return Ar(i, function(e) {
                return typeof e == "object" && (e = Me(e)), encodeURIComponent(mr(e.toString()));
              });
            }
            function Nr(i) {
              var e = Xt(i, function(o) {
                return o !== void 0;
              }), r = Wt(Ir(Rr(e)), V.method("join", "=")).join("&");
              return r;
            }
            function $r(i) {
              var e = [], r = [];
              return (function o(c, p) {
                var w, P, E;
                switch (typeof c) {
                  case "object":
                    if (!c)
                      return null;
                    for (w = 0; w < e.length; w += 1)
                      if (e[w] === c)
                        return { $ref: r[w] };
                    if (e.push(c), r.push(p), Object.prototype.toString.apply(c) === "[object Array]")
                      for (E = [], w = 0; w < c.length; w += 1)
                        E[w] = o(c[w], p + "[" + w + "]");
                    else {
                      E = {};
                      for (P in c)
                        Object.prototype.hasOwnProperty.call(c, P) && (E[P] = o(c[P], p + "[" + JSON.stringify(P) + "]"));
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
                return JSON.stringify($r(i));
              }
            }
            class Ur {
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
                var o = Er.apply(this, arguments);
                bt.log ? bt.log(o) : bt.logToConsole && e.bind(this)(o);
              }
            }
            var U = new Ur(), Dr = function(i, e, r, o, c) {
              (r.headers !== void 0 || r.headersProvider != null) && U.warn(`To send headers with the ${o.toString()} request, you must use AJAX, rather than JSONP.`);
              var p = i.nextAuthCallbackID.toString();
              i.nextAuthCallbackID++;
              var w = i.getDocument(), P = w.createElement("script");
              i.auth_callbacks[p] = function(N) {
                c(null, N);
              };
              var E = "Pusher.auth_callbacks['" + p + "']";
              P.src = r.endpoint + "?callback=" + encodeURIComponent(E) + "&" + e;
              var I = w.getElementsByTagName("head")[0] || w.documentElement;
              I.insertBefore(P, I.firstChild);
            }, Hr = Dr;
            class Mr {
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
            class jr {
              constructor(e, r) {
                this.url = e, this.data = r;
              }
              send(e) {
                if (!this.request) {
                  var r = Nr(this.data), o = this.url + "/" + e.number + "?" + r;
                  this.request = O.createScriptRequest(o), this.request.send(e);
                }
              }
              cleanup() {
                this.request && this.request.cleanup();
              }
            }
            var zr = function(i, e) {
              return function(r, o) {
                var c = "http" + (e ? "s" : "") + "://", p = c + (i.host || i.options.host) + i.options.path, w = O.createJSONPRequest(p, r), P = O.ScriptReceivers.create(function(E, I) {
                  h.remove(P), w.cleanup(), I && I.host && (i.host = I.host), o && o(E, I);
                });
                w.send(P);
              };
            }, qr = {
              name: "jsonp",
              getAgent: zr
            }, Br = qr;
            function ut(i, e, r) {
              var o = i + (e.useTLS ? "s" : ""), c = e.useTLS ? e.hostTLS : e.hostNonTLS;
              return o + "://" + c + r;
            }
            function lt(i, e) {
              var r = "/app/" + i, o = "?protocol=" + _.PROTOCOL + "&client=js&version=" + _.VERSION + (e ? "&" + e : "");
              return r + o;
            }
            var Fr = {
              getInitial: function(i, e) {
                var r = (e.httpPath || "") + lt(i, "flash=false");
                return ut("ws", e, r);
              }
            }, Wr = {
              getInitial: function(i, e) {
                var r = (e.httpPath || "/pusher") + lt(i);
                return ut("http", e, r);
              }
            }, Jr = {
              getInitial: function(i, e) {
                return ut("http", e, e.httpPath || "/pusher");
              },
              getPath: function(i, e) {
                return lt(i);
              }
            };
            class Xr {
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
                var c = e ? [ht(e)] : Ft(this._callbacks);
                r || o ? this.removeCallback(c, r, o) : this.removeAllCallbacks(c);
              }
              removeCallback(e, r, o) {
                Pe(e, function(c) {
                  this._callbacks[c] = Jt(this._callbacks[c] || [], function(p) {
                    return r && r !== p.fn || o && o !== p.context;
                  }), this._callbacks[c].length === 0 && delete this._callbacks[c];
                }, this);
              }
              removeAllCallbacks(e) {
                Pe(e, function(r) {
                  delete this._callbacks[r];
                }, this);
              }
            }
            function ht(i) {
              return "_" + i;
            }
            class se {
              constructor(e) {
                this.callbacks = new Xr(), this.global_callbacks = [], this.failThrough = e;
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
                return e ? (this.global_callbacks = Jt(this.global_callbacks || [], (r) => r !== e), this) : (this.global_callbacks = [], this);
              }
              unbind_all() {
                return this.unbind(), this.unbind_global(), this;
              }
              emit(e, r, o) {
                for (var c = 0; c < this.global_callbacks.length; c++)
                  this.global_callbacks[c](e, r);
                var p = this.callbacks.get(e), w = [];
                if (o ? w.push(r, o) : r && w.push(r), p && p.length > 0)
                  for (var c = 0; c < p.length; c++)
                    p[c].fn.apply(p[c].context || window, w);
                else this.failThrough && this.failThrough(e, r);
                return this;
              }
            }
            class Vr extends se {
              constructor(e, r, o, c, p) {
                super(), this.initialize = O.transportConnectionInitializer, this.hooks = e, this.name = r, this.priority = o, this.key = c, this.options = p, this.state = "new", this.timeline = p.timeline, this.activityTimeout = p.activityTimeout, this.id = this.timeline.generateUniqueID();
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
                  return V.defer(() => {
                    this.onError(r), this.changeState("closed");
                  }), !1;
                }
                return this.bindListeners(), U.debug("Connecting", { transport: this.name, url: e }), this.changeState("connecting"), !0;
              }
              close() {
                return this.socket ? (this.socket.close(), !0) : !1;
              }
              send(e) {
                return this.state === "open" ? (V.defer(() => {
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
                return Q({ cid: this.id }, e);
              }
            }
            class be {
              constructor(e) {
                this.hooks = e;
              }
              isSupported(e) {
                return this.hooks.isSupported(e);
              }
              createConnection(e, r, o, c) {
                return new Vr(this.hooks, e, r, o, c);
              }
            }
            var Gr = new be({
              urls: Fr,
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
            }), Gt = {
              urls: Wr,
              handlesActivityChecks: !1,
              supportsPing: !0,
              isInitialized: function() {
                return !0;
              }
            }, Kt = Q({
              getSocket: function(i) {
                return O.HTTPFactory.createStreamingSocket(i);
              }
            }, Gt), Yt = Q({
              getSocket: function(i) {
                return O.HTTPFactory.createPollingSocket(i);
              }
            }, Gt), Qt = {
              isSupported: function() {
                return O.isXHRSupported();
              }
            }, Kr = new be(Q({}, Kt, Qt)), Yr = new be(Q({}, Yt, Qt)), Qr = {
              ws: Gr,
              xhr_streaming: Kr,
              xhr_polling: Yr
            }, je = Qr, Zr = new be({
              file: "sockjs",
              urls: Jr,
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
            }), Zt = {
              isSupported: function(i) {
                var e = O.isXDRSupported(i.useTLS);
                return e;
              }
            }, ei = new be(Q({}, Kt, Zt)), ti = new be(Q({}, Yt, Zt));
            je.xdr_streaming = ei, je.xdr_polling = ti, je.sockjs = Zr;
            var ni = je;
            class ri extends se {
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
            var ii = new ri();
            class si {
              constructor(e, r, o) {
                this.manager = e, this.transport = r, this.minPingDelay = o.minPingDelay, this.maxPingDelay = o.maxPingDelay, this.pingDelay = void 0;
              }
              createConnection(e, r, o, c) {
                c = Q({}, c, {
                  activityTimeout: this.pingDelay
                });
                var p = this.transport.createConnection(e, r, o, c), w = null, P = function() {
                  p.unbind("open", P), p.bind("closed", E), w = V.now();
                }, E = (I) => {
                  if (p.unbind("closed", E), I.code === 1002 || I.code === 1003)
                    this.manager.reportDeath();
                  else if (!I.wasClean && w) {
                    var N = V.now() - w;
                    N < 2 * this.maxPingDelay && (this.manager.reportDeath(), this.pingDelay = Math.max(N / 2, this.minPingDelay));
                  }
                };
                return p.bind("open", P), p;
              }
              isSupported(e) {
                return this.manager.isAlive() && this.transport.isSupported(e);
              }
            }
            const en = {
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
                var e = en.decodeMessage(i);
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
            var fe = en;
            class oi extends se {
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
                    } catch (p) {
                      this.emit("error", {
                        type: "MessageParseError",
                        error: p,
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
            class ai {
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
                    connection: new oi(r.id, this.transport),
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
                this.callback(Q({ transport: this.transport, action: e }, r));
              }
            }
            class ci {
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
                  }, e instanceof X ? { status: e.status } : {}))) : this.pusher.send_event("pusher:subscribe", {
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
            class ui {
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
            var li = function(i, e, r, o) {
              function c(p) {
                return p instanceof r ? p : new r(function(w) {
                  w(p);
                });
              }
              return new (r || (r = Promise))(function(p, w) {
                function P(N) {
                  try {
                    I(o.next(N));
                  } catch (j) {
                    w(j);
                  }
                }
                function E(N) {
                  try {
                    I(o.throw(N));
                  } catch (j) {
                    w(j);
                  }
                }
                function I(N) {
                  N.done ? p(N.value) : c(N.value).then(P, E);
                }
                I((o = o.apply(i, e || [])).next());
              });
            };
            class hi extends ft {
              constructor(e, r) {
                super(e, r), this.members = new ui();
              }
              authorize(e, r) {
                super.authorize(e, (o, c) => li(this, void 0, void 0, function* () {
                  if (!o)
                    if (c = c, c.channel_data != null) {
                      var p = JSON.parse(c.channel_data);
                      this.members.setMyID(p.user_id);
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
                    var p = this.members.removeMember(o);
                    p && this.emit("pusher:member_removed", p);
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
            var di = l(1), pt = l(0);
            class fi extends ft {
              constructor(e, r, o) {
                super(e, r), this.key = null, this.nacl = o;
              }
              authorize(e, r) {
                super.authorize(e, (o, c) => {
                  if (o) {
                    r(o, c);
                    return;
                  }
                  let p = c.shared_secret;
                  if (!p) {
                    r(new Error(`No shared_secret key in auth payload for encrypted channel: ${this.name}`), null);
                    return;
                  }
                  this.key = Object(pt.decode)(p), delete c.shared_secret, r(null, c);
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
                let p = this.nacl.secretbox.open(o, c, this.key);
                if (p === null) {
                  U.debug("Failed to decrypt an event, probably because it was encrypted with a different key. Fetching a new key from the authEndpoint..."), this.authorize(this.pusher.connection.socket_id, (w, P) => {
                    if (w) {
                      U.error(`Failed to make a request to the authEndpoint: ${P}. Unable to fetch new key, so dropping encrypted event`);
                      return;
                    }
                    if (p = this.nacl.secretbox.open(o, c, this.key), p === null) {
                      U.error("Failed to decrypt event with new key. Dropping encrypted event");
                      return;
                    }
                    this.emit(e, this.getDataToEmit(p));
                  });
                  return;
                }
                this.emit(e, this.getDataToEmit(p));
              }
              getDataToEmit(e) {
                let r = Object(di.decode)(e);
                try {
                  return JSON.parse(r);
                } catch {
                  return r;
                }
              }
            }
            class pi extends se {
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
                return Q({}, e, {
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
                return Q({}, e, {
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
            class _i {
              constructor() {
                this.channels = {};
              }
              add(e, r) {
                return this.channels[e] || (this.channels[e] = vi(e, r)), this.channels[e];
              }
              all() {
                return Or(this.channels);
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
            function vi(i, e) {
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
                  throw new m('Cannot create a channel with name "' + i + '".');
                return oe.createChannel(i, e);
              }
            }
            var gi = {
              createChannels() {
                return new _i();
              },
              createConnectionManager(i, e) {
                return new pi(i, e);
              },
              createChannel(i, e) {
                return new dt(i, e);
              },
              createPrivateChannel(i, e) {
                return new ft(i, e);
              },
              createPresenceChannel(i, e) {
                return new hi(i, e);
              },
              createEncryptedChannel(i, e, r) {
                return new fi(i, e, r);
              },
              createTimelineSender(i, e) {
                return new ci(i, e);
              },
              createHandshake(i, e) {
                return new ai(i, e);
              },
              createAssistantToTheTransportManager(i, e, r) {
                return new si(i, e, r);
              }
            }, oe = gi;
            class tn {
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
                return Vt(this.strategies, V.method("isSupported"));
              }
              connect(e, r) {
                var o = this.strategies, c = 0, p = this.timeout, w = null, P = (E, I) => {
                  I ? r(null, I) : (c = c + 1, this.loop && (c = c % o.length), c < o.length ? (p && (p = p * 2, this.timeoutLimit && (p = Math.min(p, this.timeoutLimit))), w = this.tryStrategy(o[c], e, { timeout: p, failFast: this.failFast }, P)) : r(!0));
                };
                return w = this.tryStrategy(o[c], e, { timeout: p, failFast: this.failFast }, P), {
                  abort: function() {
                    w.abort();
                  },
                  forceMinPriority: function(E) {
                    e = E, w && w.forceMinPriority(E);
                  }
                };
              }
              tryStrategy(e, r, o, c) {
                var p = null, w = null;
                return o.timeout > 0 && (p = new de(o.timeout, function() {
                  w.abort(), c(!0);
                })), w = e.connect(r, function(P, E) {
                  P && p && p.isRunning() && !o.failFast || (p && p.ensureAborted(), c(P, E));
                }), {
                  abort: function() {
                    p && p.ensureAborted(), w.abort();
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
                return Vt(this.strategies, V.method("isSupported"));
              }
              connect(e, r) {
                return mi(this.strategies, e, function(o, c) {
                  return function(p, w) {
                    if (c[o].error = p, p) {
                      bi(c) && r(!0);
                      return;
                    }
                    Pe(c, function(P) {
                      P.forceMinPriority(w.transport.priority);
                    }), r(null, w);
                  };
                });
              }
            }
            function mi(i, e, r) {
              var o = Wt(i, function(c, p, w, P) {
                return c.connect(e, r(p, P));
              });
              return {
                abort: function() {
                  Pe(o, yi);
                },
                forceMinPriority: function(c) {
                  Pe(o, function(p) {
                    p.forceMinPriority(c);
                  });
                }
              };
            }
            function bi(i) {
              return Lr(i, function(e) {
                return !!e.error;
              });
            }
            function yi(i) {
              !i.error && !i.aborted && (i.abort(), i.aborted = !0);
            }
            class wi {
              constructor(e, r, o) {
                this.strategy = e, this.transports = r, this.ttl = o.ttl || 1800 * 1e3, this.usingTLS = o.useTLS, this.timeline = o.timeline;
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.usingTLS, c = Si(o), p = c && c.cacheSkipCount ? c.cacheSkipCount : 0, w = [this.strategy];
                if (c && c.timestamp + this.ttl >= V.now()) {
                  var P = this.transports[c.transport];
                  P && (["ws", "wss"].includes(c.transport) || p > 3 ? (this.timeline.info({
                    cached: !0,
                    transport: c.transport,
                    latency: c.latency
                  }), w.push(new pe([P], {
                    timeout: c.latency * 2 + 1e3,
                    failFast: !0
                  }))) : p++);
                }
                var E = V.now(), I = w.pop().connect(e, function N(j, Be) {
                  j ? (nn(o), w.length > 0 ? (E = V.now(), I = w.pop().connect(e, N)) : r(j)) : (xi(o, Be.transport.name, V.now() - E, p), r(null, Be));
                });
                return {
                  abort: function() {
                    I.abort();
                  },
                  forceMinPriority: function(N) {
                    e = N, I && I.forceMinPriority(N);
                  }
                };
              }
            }
            function vt(i) {
              return "pusherTransport" + (i ? "TLS" : "NonTLS");
            }
            function Si(i) {
              var e = O.getLocalStorage();
              if (e)
                try {
                  var r = e[vt(i)];
                  if (r)
                    return JSON.parse(r);
                } catch {
                  nn(i);
                }
              return null;
            }
            function xi(i, e, r, o) {
              var c = O.getLocalStorage();
              if (c)
                try {
                  c[vt(i)] = Me({
                    timestamp: V.now(),
                    transport: e,
                    latency: r,
                    cacheSkipCount: o
                  });
                } catch {
                }
            }
            function nn(i) {
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
                var o = this.strategy, c, p = new de(this.options.delay, function() {
                  c = o.connect(e, r);
                });
                return {
                  abort: function() {
                    p.ensureAborted(), c && c.abort();
                  },
                  forceMinPriority: function(w) {
                    e = w, c && c.forceMinPriority(w);
                  }
                };
              }
            }
            class Ee {
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
            class ki {
              constructor(e) {
                this.strategy = e;
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.strategy.connect(e, function(c, p) {
                  p && o.abort(), r(c, p);
                });
                return o;
              }
            }
            function Oe(i) {
              return function() {
                return i.isSupported();
              };
            }
            var Ci = function(i, e, r) {
              var o = {};
              function c(pn, ks, Cs, Ts, Ps) {
                var _n = r(i, pn, ks, Cs, Ts, Ps);
                return o[pn] = _n, _n;
              }
              var p = Object.assign({}, e, {
                hostNonTLS: i.wsHost + ":" + i.wsPort,
                hostTLS: i.wsHost + ":" + i.wssPort,
                httpPath: i.wsPath
              }), w = Object.assign({}, p, {
                useTLS: !0
              }), P = Object.assign({}, e, {
                hostNonTLS: i.httpHost + ":" + i.httpPort,
                hostTLS: i.httpHost + ":" + i.httpsPort,
                httpPath: i.httpPath
              }), E = {
                loop: !0,
                timeout: 15e3,
                timeoutLimit: 6e4
              }, I = new tn({
                minPingDelay: 1e4,
                maxPingDelay: i.activityTimeout
              }), N = new tn({
                lives: 2,
                minPingDelay: 1e4,
                maxPingDelay: i.activityTimeout
              }), j = c("ws", "ws", 3, p, I), Be = c("wss", "ws", 3, w, I), bs = c("sockjs", "sockjs", 1, P), cn = c("xhr_streaming", "xhr_streaming", 1, P, N), ys = c("xdr_streaming", "xdr_streaming", 1, P, N), un = c("xhr_polling", "xhr_polling", 1, P), ws = c("xdr_polling", "xdr_polling", 1, P), ln = new pe([j], E), Ss = new pe([Be], E), xs = new pe([bs], E), hn = new pe([
                new Ee(Oe(cn), cn, ys)
              ], E), dn = new pe([
                new Ee(Oe(un), un, ws)
              ], E), fn = new pe([
                new Ee(Oe(hn), new _t([
                  hn,
                  new ze(dn, { delay: 4e3 })
                ]), dn)
              ], E), yt = new Ee(Oe(fn), fn, xs), wt;
              return e.useTLS ? wt = new _t([
                ln,
                new ze(yt, { delay: 2e3 })
              ]) : wt = new _t([
                ln,
                new ze(Ss, { delay: 2e3 }),
                new ze(yt, { delay: 5e3 })
              ]), new wi(new ki(new Ee(Oe(j), wt, yt)), o, {
                ttl: 18e5,
                timeline: e.timeline,
                useTLS: e.useTLS
              });
            }, Ti = Ci, Pi = (function() {
              var i = this;
              i.timeline.info(i.buildTimelineMessage({
                transport: i.name + (i.options.useTLS ? "s" : "")
              })), i.hooks.isInitialized() ? i.changeState("initialized") : i.hooks.file ? (i.changeState("initializing"), d.load(i.hooks.file, { useTLS: i.options.useTLS }, function(e, r) {
                i.hooks.isInitialized() ? (i.changeState("initialized"), r(!0)) : (e && i.onError(e), i.onClose(), r(!1));
              })) : i.onClose();
            }), Ei = {
              getRequest: function(i) {
                var e = new window.XDomainRequest();
                return e.ontimeout = function() {
                  i.emit("error", new x()), i.close();
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
            }, Oi = Ei;
            const Ai = 256 * 1024;
            class Ii extends se {
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
                return this.position === e.length && e.length > Ai;
              }
            }
            var gt;
            (function(i) {
              i[i.CONNECTING = 0] = "CONNECTING", i[i.OPEN = 1] = "OPEN", i[i.CLOSED = 3] = "CLOSED";
            })(gt || (gt = {}));
            var _e = gt, Li = 1;
            class Ri {
              constructor(e, r) {
                this.hooks = e, this.session = sn(1e3) + "/" + Di(8), this.location = Ni(r), this.readyState = _e.CONNECTING, this.openStream();
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
                    return O.createSocketRequest("POST", rn($i(this.location, this.session))).start(e), !0;
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
                this.readyState === _e.CONNECTING ? (e && e.hostname && (this.location.base = Ui(this.location.base, e.hostname)), this.readyState = _e.OPEN, this.onopen && this.onopen()) : this.onClose(1006, "Server lost session", !0);
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
                this.stream = O.createSocketRequest("POST", rn(this.hooks.getReceiveURL(this.location, this.session))), this.stream.bind("chunk", (e) => {
                  this.onChunk(e);
                }), this.stream.bind("finished", (e) => {
                  this.hooks.onFinished(this, e);
                }), this.stream.bind("buffer_too_long", () => {
                  this.reconnect();
                });
                try {
                  this.stream.start();
                } catch (e) {
                  V.defer(() => {
                    this.onError(e), this.onClose(1006, "Could not start streaming", !1);
                  });
                }
              }
              closeStream() {
                this.stream && (this.stream.unbind_all(), this.stream.close(), this.stream = null);
              }
            }
            function Ni(i) {
              var e = /([^\?]*)\/*(\??.*)/.exec(i);
              return {
                base: e[1],
                queryString: e[2]
              };
            }
            function $i(i, e) {
              return i.base + "/" + e + "/xhr_send";
            }
            function rn(i) {
              var e = i.indexOf("?") === -1 ? "?" : "&";
              return i + e + "t=" + +/* @__PURE__ */ new Date() + "&n=" + Li++;
            }
            function Ui(i, e) {
              var r = /(https?:\/\/)([^\/:]+)((\/|:)?.*)/.exec(i);
              return r[1] + e + r[3];
            }
            function sn(i) {
              return O.randomInt(i);
            }
            function Di(i) {
              for (var e = [], r = 0; r < i; r++)
                e.push(sn(32).toString(32));
              return e.join("");
            }
            var Hi = Ri, Mi = {
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
            }, ji = Mi, zi = {
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
            }, qi = zi, Bi = {
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
            }, Fi = Bi, Wi = {
              createStreamingSocket(i) {
                return this.createSocket(ji, i);
              },
              createPollingSocket(i) {
                return this.createSocket(qi, i);
              },
              createSocket(i, e) {
                return new Hi(i, e);
              },
              createXHR(i, e) {
                return this.createRequest(Fi, i, e);
              },
              createRequest(i, e, r) {
                return new Ii(i, e, r);
              }
            }, on = Wi;
            on.createXDR = function(i, e) {
              return this.createRequest(Oi, i, e);
            };
            var Ji = on, Xi = {
              nextAuthCallbackID: 1,
              auth_callbacks: {},
              ScriptReceivers: h,
              DependenciesReceivers: y,
              getDefaultStrategy: Ti,
              Transports: ni,
              transportConnectionInitializer: Pi,
              HTTPFactory: Ji,
              TimelineTransport: Br,
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
                return { ajax: G, jsonp: Hr };
              },
              onDocumentBody(i) {
                document.body ? i() : setTimeout(() => {
                  this.onDocumentBody(i);
                }, 0);
              },
              createJSONPRequest(i, e) {
                return new jr(i, e);
              },
              createScriptRequest(i) {
                return new Mr(i);
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
                return ii;
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
            }, O = Xi, mt;
            (function(i) {
              i[i.ERROR = 3] = "ERROR", i[i.INFO = 6] = "INFO", i[i.DEBUG = 7] = "DEBUG";
            })(mt || (mt = {}));
            var qe = mt;
            class Vi {
              constructor(e, r, o) {
                this.key = e, this.session = r, this.events = [], this.options = o || {}, this.sent = 0, this.uniqueID = 0;
              }
              log(e, r) {
                e <= this.options.level && (this.events.push(Q({}, r, { timestamp: V.now() })), this.options.limit && this.events.length > this.options.limit && this.events.shift());
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
                var o = Q({
                  session: this.session,
                  bundle: this.sent + 1,
                  key: this.key,
                  lib: "js",
                  version: this.options.version,
                  cluster: this.options.cluster,
                  features: this.options.features,
                  timeline: this.events
                }, this.options.params);
                return this.events = [], e(o, (c, p) => {
                  c || this.sent++, r && r(c, p);
                }), !0;
              }
              generateUniqueID() {
                return this.uniqueID++, this.uniqueID;
              }
            }
            class Gi {
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
                    return an(new A(), r);
                } else return an(new Y(), r);
                var o = !1, c = this.transport.createConnection(this.name, this.priority, this.options.key, this.options), p = null, w = function() {
                  c.unbind("initialized", w), c.connect();
                }, P = function() {
                  p = oe.createHandshake(c, function(j) {
                    o = !0, N(), r(null, j);
                  });
                }, E = function(j) {
                  N(), r(j);
                }, I = function() {
                  N();
                  var j;
                  j = Me(c), r(new $(j));
                }, N = function() {
                  c.unbind("initialized", w), c.unbind("open", P), c.unbind("error", E), c.unbind("closed", I);
                };
                return c.bind("initialized", w), c.bind("open", P), c.bind("error", E), c.bind("closed", I), c.initialize(), {
                  abort: () => {
                    o || (N(), p ? p.close() : c.close());
                  },
                  forceMinPriority: (j) => {
                    o || this.priority < j && (p ? p.close() : c.close());
                  }
                };
              }
            }
            function an(i, e) {
              return V.defer(function() {
                e(i);
              }), {
                abort: function() {
                },
                forceMinPriority: function() {
                }
              };
            }
            const { Transports: Ki } = O;
            var Yi = function(i, e, r, o, c, p) {
              var w = Ki[r];
              if (!w)
                throw new K(r);
              var P = (!i.enabledTransports || Bt(i.enabledTransports, e) !== -1) && (!i.disabledTransports || Bt(i.disabledTransports, e) === -1), E;
              return P ? (c = Object.assign({ ignoreNullOrigin: i.ignoreNullOrigin }, c), E = new Gi(e, o, p ? p.getAssistant(w) : w, c)) : E = Qi, E;
            }, Qi = {
              isSupported: function() {
                return !1;
              },
              connect: function(i, e) {
                var r = V.defer(function() {
                  e(new Y());
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
            function Zi(i) {
              if (i == null)
                throw "You must pass an options object";
              if (i.cluster == null)
                throw "Options object must provide a cluster";
              "disableStats" in i && U.warn("The disableStats option is deprecated in favor of enableStats");
            }
            const es = (i, e) => {
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
            var ts = (i) => {
              if (typeof O.getAuthorizers()[i.transport] > "u")
                throw `'${i.transport}' is not a recognized auth transport`;
              return (e, r) => {
                const o = es(e, i);
                O.getAuthorizers()[i.transport](O, o, i, C.UserAuthentication, r);
              };
            };
            const ns = (i, e) => {
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
            var rs = (i) => {
              if (typeof O.getAuthorizers()[i.transport] > "u")
                throw `'${i.transport}' is not a recognized auth transport`;
              return (e, r) => {
                const o = ns(e, i);
                O.getAuthorizers()[i.transport](O, o, i, C.ChannelAuthorization, r);
              };
            };
            const is = (i, e, r) => {
              const o = {
                authTransport: e.transport,
                authEndpoint: e.endpoint,
                auth: {
                  params: e.params,
                  headers: e.headers
                }
              };
              return (c, p) => {
                const w = i.channel(c.channelName);
                r(w, o).authorize(c.socketId, p);
              };
            };
            function ss(i, e) {
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
                enableStats: ls(i),
                httpHost: os(i),
                useTLS: us(i),
                wsHost: as(i),
                userAuthenticator: hs(i),
                channelAuthorizer: fs(i, e)
              };
              return "disabledTransports" in i && (r.disabledTransports = i.disabledTransports), "enabledTransports" in i && (r.enabledTransports = i.enabledTransports), "ignoreNullOrigin" in i && (r.ignoreNullOrigin = i.ignoreNullOrigin), "timelineParams" in i && (r.timelineParams = i.timelineParams), "nacl" in i && (r.nacl = i.nacl), r;
            }
            function os(i) {
              return i.httpHost ? i.httpHost : i.cluster ? `sockjs-${i.cluster}.pusher.com` : _.httpHost;
            }
            function as(i) {
              return i.wsHost ? i.wsHost : cs(i.cluster);
            }
            function cs(i) {
              return `ws-${i}.pusher.com`;
            }
            function us(i) {
              return O.getProtocol() === "https:" ? !0 : i.forceTLS !== !1;
            }
            function ls(i) {
              return "enableStats" in i ? i.enableStats : "disableStats" in i ? !i.disableStats : !1;
            }
            function hs(i) {
              const e = Object.assign(Object.assign({}, _.userAuthentication), i.userAuthentication);
              return "customHandler" in e && e.customHandler != null ? e.customHandler : ts(e);
            }
            function ds(i, e) {
              let r;
              return "channelAuthorization" in i ? r = Object.assign(Object.assign({}, _.channelAuthorization), i.channelAuthorization) : (r = {
                transport: i.authTransport || _.authTransport,
                endpoint: i.authEndpoint || _.authEndpoint
              }, "auth" in i && ("params" in i.auth && (r.params = i.auth.params), "headers" in i.auth && (r.headers = i.auth.headers)), "authorizer" in i && (r.customHandler = is(e, r, i.authorizer))), r;
            }
            function fs(i, e) {
              const r = ds(i, e);
              return "customHandler" in r && r.customHandler != null ? r.customHandler : rs(r);
            }
            class ps extends se {
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
            function _s() {
              let i, e;
              return { promise: new Promise((o, c) => {
                i = o, e = c;
              }), resolve: i, reject: e };
            }
            var vs = _s;
            class gs extends se {
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
                }), this.watchlist = new ps(e), this.pusher.connection.bind("message", (r) => {
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
                const { promise: e, resolve: r } = vs();
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
                return Ft(Xt({ ws: O.Transports.ws }, function(e) {
                  return e.isSupported({});
                }));
              }
              constructor(e, r) {
                ms(e), Zi(r), this.key = e, this.config = ss(r, this), this.channels = oe.createChannels(), this.global_emitter = new se(), this.sessionID = O.randomInt(1e9), this.timeline = new Vi(this.key, this.sessionID, {
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
                var o = (c) => O.getDefaultStrategy(this.config, c, Yi);
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
                  var p = c.event, w = p.indexOf("pusher_internal:") === 0;
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
                }), B.instances.push(this), this.timeline.info({ instances: B.instances.length }), this.user = new gs(this), B.isReady && this.connect();
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
                  this.timelineSenderTimer = new Tr(6e4, function() {
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
            function ms(i) {
              if (i == null)
                throw "You must pass your app key when you instantiate Pusher.";
            }
            O.setup(B);
          })
          /******/
        ])
      );
    });
  })(Ct)), Ct.exports;
}
var gr = Zo();
const ea = /* @__PURE__ */ Qo(gr), ta = /* @__PURE__ */ Es({
  __proto__: null,
  default: ea
}, [gr]);
export {
  Yo as default
};
