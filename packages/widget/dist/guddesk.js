function Cs(n, t) {
  for (var s = 0; s < t.length; s++) {
    const c = t[s];
    if (typeof c != "string" && !Array.isArray(c)) {
      for (const l in c)
        if (l !== "default" && !(l in n)) {
          const u = Object.getOwnPropertyDescriptor(c, l);
          u && Object.defineProperty(n, l, u.get ? u : {
            enumerable: !0,
            get: () => c[l]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
var it, R, Nn, $n, ge, pn, Un, Dn, Hn, Lt, Ct, Tt, Ke = {}, Ye = [], Ts = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, st = Array.isArray;
function ce(n, t) {
  for (var s in t) n[s] = t[s];
  return n;
}
function Rt(n) {
  n && n.parentNode && n.parentNode.removeChild(n);
}
function Mn(n, t, s) {
  var c, l, u, h = {};
  for (u in t) u == "key" ? c = t[u] : u == "ref" ? l = t[u] : h[u] = t[u];
  if (arguments.length > 2 && (h.children = arguments.length > 3 ? it.call(arguments, 2) : s), typeof n == "function" && n.defaultProps != null) for (u in n.defaultProps) h[u] === void 0 && (h[u] = n.defaultProps[u]);
  return Ge(n, h, c, l, null);
}
function Ge(n, t, s, c, l) {
  var u = { type: n, props: t, key: s, ref: c, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: l ?? ++Nn, __i: -1, __u: 0 };
  return l == null && R.vnode != null && R.vnode(u), u;
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
function Ps(n) {
  if (n.__P && n.__d) {
    var t = n.__v, s = t.__e, c = [], l = [], u = ce({}, t);
    u.__v = t.__v + 1, R.vnode && R.vnode(u), Nt(n.__P, u, t, n.__n, n.__P.namespaceURI, 32 & t.__u ? [s] : null, c, s ?? Se(t), !!(32 & t.__u), l), u.__v = t.__v, u.__.__k[u.__i] = u, Bn(c, u, l), t.__e = t.__ = null, u.__e != s && jn(u);
  }
}
function jn(n) {
  if ((n = n.__) != null && n.__c != null) return n.__e = n.__c.base = null, n.__k.some(function(t) {
    if (t != null && t.__e != null) return n.__e = n.__c.base = t.__e;
  }), jn(n);
}
function _n(n) {
  (!n.__d && (n.__d = !0) && ge.push(n) && !Qe.__r++ || pn != R.debounceRendering) && ((pn = R.debounceRendering) || Un)(Qe);
}
function Qe() {
  for (var n, t = 1; ge.length; ) ge.length > t && ge.sort(Dn), n = ge.shift(), t = ge.length, Ps(n);
  Qe.__r = 0;
}
function zn(n, t, s, c, l, u, h, f, _, v, y) {
  var d, S, b, T, C, g, m, x = c && c.__k || Ye, E = t.length;
  for (_ = Os(s, t, x, _, E), d = 0; d < E; d++) (b = s.__k[d]) != null && (S = b.__i != -1 && x[b.__i] || Ke, b.__i = d, g = Nt(n, b, S, l, u, h, f, _, v, y), T = b.__e, b.ref && S.ref != b.ref && (S.ref && $t(S.ref, null, b), y.push(b.ref, b.__c || T, b)), C == null && T != null && (C = T), (m = !!(4 & b.__u)) || S.__k === b.__k ? _ = qn(b, _, n, m) : typeof b.type == "function" && g !== void 0 ? _ = g : T && (_ = T.nextSibling), b.__u &= -7);
  return s.__e = C, _;
}
function Os(n, t, s, c, l) {
  var u, h, f, _, v, y = s.length, d = y, S = 0;
  for (n.__k = new Array(l), u = 0; u < l; u++) (h = t[u]) != null && typeof h != "boolean" && typeof h != "function" ? (typeof h == "string" || typeof h == "number" || typeof h == "bigint" || h.constructor == String ? h = n.__k[u] = Ge(null, h, null, null, null) : st(h) ? h = n.__k[u] = Ge(le, { children: h }, null, null, null) : h.constructor === void 0 && h.__b > 0 ? h = n.__k[u] = Ge(h.type, h.props, h.key, h.ref ? h.ref : null, h.__v) : n.__k[u] = h, _ = u + S, h.__ = n, h.__b = n.__b + 1, f = null, (v = h.__i = As(h, s, _, d)) != -1 && (d--, (f = s[v]) && (f.__u |= 2)), f == null || f.__v == null ? (v == -1 && (l > y ? S-- : l < y && S++), typeof h.type != "function" && (h.__u |= 4)) : v != _ && (v == _ - 1 ? S-- : v == _ + 1 ? S++ : (v > _ ? S-- : S++, h.__u |= 4))) : n.__k[u] = null;
  if (d) for (u = 0; u < y; u++) (f = s[u]) != null && (2 & f.__u) == 0 && (f.__e == c && (c = Se(f)), Wn(f, f));
  return c;
}
function qn(n, t, s, c) {
  var l, u;
  if (typeof n.type == "function") {
    for (l = n.__k, u = 0; l && u < l.length; u++) l[u] && (l[u].__ = n, t = qn(l[u], t, s, c));
    return t;
  }
  n.__e != t && (c && (t && n.type && !t.parentNode && (t = Se(n)), s.insertBefore(n.__e, t || null)), t = n.__e);
  do
    t = t && t.nextSibling;
  while (t != null && t.nodeType == 8);
  return t;
}
function As(n, t, s, c) {
  var l, u, h, f = n.key, _ = n.type, v = t[s], y = v != null && (2 & v.__u) == 0;
  if (v === null && f == null || y && f == v.key && _ == v.type) return s;
  if (c > (y ? 1 : 0)) {
    for (l = s - 1, u = s + 1; l >= 0 || u < t.length; ) if ((v = t[h = l >= 0 ? l-- : u++]) != null && (2 & v.__u) == 0 && f == v.key && _ == v.type) return h;
  }
  return -1;
}
function vn(n, t, s) {
  t[0] == "-" ? n.setProperty(t, s ?? "") : n[t] = s == null ? "" : typeof s != "number" || Ts.test(t) ? s : s + "px";
}
function We(n, t, s, c, l) {
  var u, h;
  e: if (t == "style") if (typeof s == "string") n.style.cssText = s;
  else {
    if (typeof c == "string" && (n.style.cssText = c = ""), c) for (t in c) s && t in s || vn(n.style, t, "");
    if (s) for (t in s) c && s[t] == c[t] || vn(n.style, t, s[t]);
  }
  else if (t[0] == "o" && t[1] == "n") u = t != (t = t.replace(Hn, "$1")), h = t.toLowerCase(), t = h in n || t == "onFocusOut" || t == "onFocusIn" ? h.slice(2) : t.slice(2), n.l || (n.l = {}), n.l[t + u] = s, s ? c ? s.u = c.u : (s.u = Lt, n.addEventListener(t, u ? Tt : Ct, u)) : n.removeEventListener(t, u ? Tt : Ct, u);
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
function gn(n) {
  return function(t) {
    if (this.l) {
      var s = this.l[t.type + n];
      if (t.t == null) t.t = Lt++;
      else if (t.t < s.u) return;
      return s(R.event ? R.event(t) : t);
    }
  };
}
function Nt(n, t, s, c, l, u, h, f, _, v) {
  var y, d, S, b, T, C, g, m, x, E, $, D, K, Y, J, M = t.type;
  if (t.constructor !== void 0) return null;
  128 & s.__u && (_ = !!(32 & s.__u), u = [f = t.__e = s.__e]), (y = R.__b) && y(t);
  e: if (typeof M == "function") try {
    if (m = t.props, x = "prototype" in M && M.prototype.render, E = (y = M.contextType) && c[y.__c], $ = y ? E ? E.props.value : y.__ : c, s.__c ? g = (d = t.__c = s.__c).__ = d.__E : (x ? t.__c = d = new M(m, $) : (t.__c = d = new Le(m, $), d.constructor = M, d.render = Is), E && E.sub(d), d.state || (d.state = {}), d.__n = c, S = d.__d = !0, d.__h = [], d._sb = []), x && d.__s == null && (d.__s = d.state), x && M.getDerivedStateFromProps != null && (d.__s == d.state && (d.__s = ce({}, d.__s)), ce(d.__s, M.getDerivedStateFromProps(m, d.__s))), b = d.props, T = d.state, d.__v = t, S) x && M.getDerivedStateFromProps == null && d.componentWillMount != null && d.componentWillMount(), x && d.componentDidMount != null && d.__h.push(d.componentDidMount);
    else {
      if (x && M.getDerivedStateFromProps == null && m !== b && d.componentWillReceiveProps != null && d.componentWillReceiveProps(m, $), t.__v == s.__v || !d.__e && d.shouldComponentUpdate != null && d.shouldComponentUpdate(m, d.__s, $) === !1) {
        t.__v != s.__v && (d.props = m, d.state = d.__s, d.__d = !1), t.__e = s.__e, t.__k = s.__k, t.__k.some(function(V) {
          V && (V.__ = t);
        }), Ye.push.apply(d.__h, d._sb), d._sb = [], d.__h.length && h.push(d);
        break e;
      }
      d.componentWillUpdate != null && d.componentWillUpdate(m, d.__s, $), x && d.componentDidUpdate != null && d.__h.push(function() {
        d.componentDidUpdate(b, T, C);
      });
    }
    if (d.context = $, d.props = m, d.__P = n, d.__e = !1, D = R.__r, K = 0, x) d.state = d.__s, d.__d = !1, D && D(t), y = d.render(d.props, d.state, d.context), Ye.push.apply(d.__h, d._sb), d._sb = [];
    else do
      d.__d = !1, D && D(t), y = d.render(d.props, d.state, d.context), d.state = d.__s;
    while (d.__d && ++K < 25);
    d.state = d.__s, d.getChildContext != null && (c = ce(ce({}, c), d.getChildContext())), x && !S && d.getSnapshotBeforeUpdate != null && (C = d.getSnapshotBeforeUpdate(b, T)), Y = y != null && y.type === le && y.key == null ? Fn(y.props.children) : y, f = zn(n, st(Y) ? Y : [Y], t, s, c, l, u, h, f, _, v), d.base = t.__e, t.__u &= -161, d.__h.length && h.push(d), g && (d.__E = d.__ = null);
  } catch (V) {
    if (t.__v = null, _ || u != null) if (V.then) {
      for (t.__u |= _ ? 160 : 128; f && f.nodeType == 8 && f.nextSibling; ) f = f.nextSibling;
      u[u.indexOf(f)] = null, t.__e = f;
    } else {
      for (J = u.length; J--; ) Rt(u[J]);
      Pt(t);
    }
    else t.__e = s.__e, t.__k = s.__k, V.then || Pt(t);
    R.__e(V, t, s);
  }
  else u == null && t.__v == s.__v ? (t.__k = s.__k, t.__e = s.__e) : f = t.__e = Es(s.__e, t, s, c, l, u, h, _, v);
  return (y = R.diffed) && y(t), 128 & t.__u ? void 0 : f;
}
function Pt(n) {
  n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some(Pt));
}
function Bn(n, t, s) {
  for (var c = 0; c < s.length; c++) $t(s[c], s[++c], s[++c]);
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
function Fn(n) {
  return typeof n != "object" || n == null || n.__b > 0 ? n : st(n) ? n.map(Fn) : ce({}, n);
}
function Es(n, t, s, c, l, u, h, f, _) {
  var v, y, d, S, b, T, C, g = s.props || Ke, m = t.props, x = t.type;
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
    for (v in g) b = g[v], v == "dangerouslySetInnerHTML" ? d = b : v == "children" || v in m || v == "value" && "defaultValue" in m || v == "checked" && "defaultChecked" in m || We(n, v, null, b, l);
    for (v in m) b = m[v], v == "children" ? S = b : v == "dangerouslySetInnerHTML" ? y = b : v == "value" ? T = b : v == "checked" ? C = b : f && typeof b != "function" || g[v] === b || We(n, v, b, g[v], l);
    if (y) f || d && (y.__html == d.__html || y.__html == n.innerHTML) || (n.innerHTML = y.__html), t.__k = [];
    else if (d && (n.innerHTML = ""), zn(t.type == "template" ? n.content : n, st(S) ? S : [S], t, s, c, x == "foreignObject" ? "http://www.w3.org/1999/xhtml" : l, u, h, u ? u[0] : s.__k && Se(s, 0), f, _), u != null) for (v = u.length; v--; ) Rt(u[v]);
    f || (v = "value", x == "progress" && T == null ? n.removeAttribute("value") : T != null && (T !== n[v] || x == "progress" && !T || x == "option" && T != g[v]) && We(n, v, T, g[v], l), v = "checked", C != null && C != n[v] && We(n, v, C, g[v], l));
  }
  return n;
}
function $t(n, t, s) {
  try {
    if (typeof n == "function") {
      var c = typeof n.__u == "function";
      c && n.__u(), c && t == null || (n.__u = n(t));
    } else n.current = t;
  } catch (l) {
    R.__e(l, s);
  }
}
function Wn(n, t, s) {
  var c, l;
  if (R.unmount && R.unmount(n), (c = n.ref) && (c.current && c.current != n.__e || $t(c, null, t)), (c = n.__c) != null) {
    if (c.componentWillUnmount) try {
      c.componentWillUnmount();
    } catch (u) {
      R.__e(u, t);
    }
    c.base = c.__P = null;
  }
  if (c = n.__k) for (l = 0; l < c.length; l++) c[l] && Wn(c[l], t, s || typeof n.type != "function");
  s || Rt(n.__e), n.__c = n.__ = n.__e = void 0;
}
function Is(n, t, s) {
  return this.constructor(n, s);
}
function Jn(n, t, s) {
  var c, l, u, h;
  t == document && (t = document.documentElement), R.__ && R.__(n, t), l = (c = !1) ? null : t.__k, u = [], h = [], Nt(t, n = t.__k = Mn(le, null, [n]), l || Ke, Ke, t.namespaceURI, l ? null : t.firstChild ? it.call(t.childNodes) : null, u, l ? l.__e : t.firstChild, c, h), Bn(u, n, h);
}
it = Ye.slice, R = { __e: function(n, t, s, c) {
  for (var l, u, h; t = t.__; ) if ((l = t.__c) && !l.__) try {
    if ((u = l.constructor) && u.getDerivedStateFromError != null && (l.setState(u.getDerivedStateFromError(n)), h = l.__d), l.componentDidCatch != null && (l.componentDidCatch(n, c || {}), h = l.__d), h) return l.__E = l;
  } catch (f) {
    n = f;
  }
  throw n;
} }, Nn = 0, $n = function(n) {
  return n != null && n.constructor === void 0;
}, Le.prototype.setState = function(n, t) {
  var s;
  s = this.__s != null && this.__s != this.state ? this.__s : this.__s = ce({}, this.state), typeof n == "function" && (n = n(ce({}, s), this.props)), n && ce(s, n), n != null && this.__v && (t && this._sb.push(t), _n(this));
}, Le.prototype.forceUpdate = function(n) {
  this.__v && (this.__e = !0, n && this.__h.push(n), _n(this));
}, Le.prototype.render = le, ge = [], Un = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Dn = function(n, t) {
  return n.__v.__b - t.__v.__b;
}, Qe.__r = 0, Hn = /(PointerCapture)$|Capture$/i, Lt = 0, Ct = gn(!1), Tt = gn(!0);
var Ue, H, wt, mn, Ze = 0, Xn = [], z = R, bn = z.__b, yn = z.__r, wn = z.diffed, Sn = z.__c, xn = z.unmount, kn = z.__;
function Ut(n, t) {
  z.__h && z.__h(H, n, Ze || t), Ze = 0;
  var s = H.__H || (H.__H = { __: [], __h: [] });
  return n >= s.__.length && s.__.push({}), s.__[n];
}
function ae(n) {
  return Ze = 1, Ls(Vn, n);
}
function Ls(n, t, s) {
  var c = Ut(Ue++, 2);
  if (c.t = n, !c.__c && (c.__ = [Vn(void 0, t), function(f) {
    var _ = c.__N ? c.__N[0] : c.__[0], v = c.t(_, f);
    _ !== v && (c.__N = [v, c.__[1]], c.__c.setState({}));
  }], c.__c = H, !H.__f)) {
    var l = function(f, _, v) {
      if (!c.__c.__H) return !0;
      var y = c.__c.__H.__.filter(function(S) {
        return S.__c;
      });
      if (y.every(function(S) {
        return !S.__N;
      })) return !u || u.call(this, f, _, v);
      var d = c.__c.props !== f;
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
  return c.__N || c.__;
}
function Ie(n, t) {
  var s = Ut(Ue++, 3);
  !z.__s && Gn(s.__H, t) && (s.__ = n, s.u = t, H.__H.__h.push(s));
}
function we(n) {
  return Ze = 5, Dt(function() {
    return { current: n };
  }, []);
}
function Dt(n, t) {
  var s = Ut(Ue++, 7);
  return Gn(s.__H, t) && (s.__ = n(), s.__H = t, s.__h = n), s.__;
}
function Rs() {
  for (var n; n = Xn.shift(); ) {
    var t = n.__H;
    if (n.__P && t) try {
      t.__h.some(Ve), t.__h.some(Ot), t.__h = [];
    } catch (s) {
      t.__h = [], z.__e(s, n.__v);
    }
  }
}
z.__b = function(n) {
  H = null, bn && bn(n);
}, z.__ = function(n, t) {
  n && t.__k && t.__k.__m && (n.__m = t.__k.__m), kn && kn(n, t);
}, z.__r = function(n) {
  yn && yn(n), Ue = 0;
  var t = (H = n.__c).__H;
  t && (wt === H ? (t.__h = [], H.__h = [], t.__.some(function(s) {
    s.__N && (s.__ = s.__N), s.u = s.__N = void 0;
  })) : (t.__h.some(Ve), t.__h.some(Ot), t.__h = [], Ue = 0)), wt = H;
}, z.diffed = function(n) {
  wn && wn(n);
  var t = n.__c;
  t && t.__H && (t.__H.__h.length && (Xn.push(t) !== 1 && mn === z.requestAnimationFrame || ((mn = z.requestAnimationFrame) || Ns)(Rs)), t.__H.__.some(function(s) {
    s.u && (s.__H = s.u), s.u = void 0;
  })), wt = H = null;
}, z.__c = function(n, t) {
  t.some(function(s) {
    try {
      s.__h.some(Ve), s.__h = s.__h.filter(function(c) {
        return !c.__ || Ot(c);
      });
    } catch (c) {
      t.some(function(l) {
        l.__h && (l.__h = []);
      }), t = [], z.__e(c, s.__v);
    }
  }), Sn && Sn(n, t);
}, z.unmount = function(n) {
  xn && xn(n);
  var t, s = n.__c;
  s && s.__H && (s.__H.__.some(function(c) {
    try {
      Ve(c);
    } catch (l) {
      t = l;
    }
  }), s.__H = void 0, t && z.__e(t, s.__v));
};
var Cn = typeof requestAnimationFrame == "function";
function Ns(n) {
  var t, s = function() {
    clearTimeout(c), Cn && cancelAnimationFrame(t), setTimeout(n);
  }, c = setTimeout(s, 35);
  Cn && (t = requestAnimationFrame(s));
}
function Ve(n) {
  var t = H, s = n.__c;
  typeof s == "function" && (n.__c = void 0, s()), H = t;
}
function Ot(n) {
  var t = H;
  n.__c = n.__(), H = t;
}
function Gn(n, t) {
  return !n || n.length !== t.length || t.some(function(s, c) {
    return s !== n[c];
  });
}
function Vn(n, t) {
  return typeof t == "function" ? t(n) : t;
}
var $s = Symbol.for("preact-signals");
function ot() {
  if (ue > 1)
    ue--;
  else {
    for (var n, t = !1; Re !== void 0; ) {
      var s = Re;
      for (Re = void 0, At++; s !== void 0; ) {
        var c = s.o;
        if (s.o = void 0, s.f &= -3, !(8 & s.f) && Qn(s)) try {
          s.c();
        } catch (l) {
          t || (n = l, t = !0);
        }
        s = c;
      }
    }
    if (At = 0, ue--, t) throw n;
  }
}
function Us(n) {
  if (ue > 0) return n();
  ue++;
  try {
    return n();
  } finally {
    ot();
  }
}
var L = void 0;
function Kn(n) {
  var t = L;
  L = void 0;
  try {
    return n();
  } finally {
    L = t;
  }
}
var Re = void 0, ue = 0, At = 0, et = 0;
function Yn(n) {
  if (L !== void 0) {
    var t = n.n;
    if (t === void 0 || t.t !== L)
      return t = { i: 0, S: n, p: L.s, n: void 0, t: L, e: void 0, x: void 0, r: t }, L.s !== void 0 && (L.s.n = t), L.s = t, n.n = t, 32 & L.f && n.S(t), t;
    if (t.i === -1)
      return t.i = 0, t.n !== void 0 && (t.n.p = t.p, t.p !== void 0 && (t.p.n = t.n), t.p = L.s, t.n = void 0, L.s.n = t, L.s = t), t;
  }
}
function W(n, t) {
  this.v = n, this.i = 0, this.n = void 0, this.t = void 0, this.W = t?.watched, this.Z = t?.unwatched, this.name = t?.name;
}
W.prototype.brand = $s;
W.prototype.h = function() {
  return !0;
};
W.prototype.S = function(n) {
  var t = this, s = this.t;
  s !== n && n.e === void 0 && (n.x = s, this.t = n, s !== void 0 ? s.e = n : Kn(function() {
    var c;
    (c = t.W) == null || c.call(t);
  }));
};
W.prototype.U = function(n) {
  var t = this;
  if (this.t !== void 0) {
    var s = n.e, c = n.x;
    s !== void 0 && (s.x = c, n.e = void 0), c !== void 0 && (c.e = s, n.x = void 0), n === this.t && (this.t = c, c === void 0 && Kn(function() {
      var l;
      (l = t.Z) == null || l.call(t);
    }));
  }
};
W.prototype.subscribe = function(n) {
  var t = this;
  return De(function() {
    var s = t.value, c = L;
    L = void 0;
    try {
      n(s);
    } finally {
      L = c;
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
  var n = L;
  L = void 0;
  try {
    return this.value;
  } finally {
    L = n;
  }
};
Object.defineProperty(W.prototype, "value", { get: function() {
  var n = Yn(this);
  return n !== void 0 && (n.i = this.i), this.v;
}, set: function(n) {
  if (n !== this.v) {
    if (At > 100) throw new Error("Cycle detected");
    this.v = n, this.i++, et++, ue++;
    try {
      for (var t = this.t; t !== void 0; t = t.x) t.t.N();
    } finally {
      ot();
    }
  }
} });
function Z(n, t) {
  return new W(n, t);
}
function Qn(n) {
  for (var t = n.s; t !== void 0; t = t.n) if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
  return !1;
}
function Zn(n) {
  for (var t = n.s; t !== void 0; t = t.n) {
    var s = t.S.n;
    if (s !== void 0 && (t.r = s), t.S.n = t, t.i = -1, t.n === void 0) {
      n.s = t;
      break;
    }
  }
}
function er(n) {
  for (var t = n.s, s = void 0; t !== void 0; ) {
    var c = t.p;
    t.i === -1 ? (t.S.U(t), c !== void 0 && (c.n = t.n), t.n !== void 0 && (t.n.p = c)) : s = t, t.S.n = t.r, t.r !== void 0 && (t.r = void 0), t = c;
  }
  n.s = s;
}
function me(n, t) {
  W.call(this, void 0), this.x = n, this.s = void 0, this.g = et - 1, this.f = 4, this.W = t?.watched, this.Z = t?.unwatched, this.name = t?.name;
}
me.prototype = new W();
me.prototype.h = function() {
  if (this.f &= -3, 1 & this.f) return !1;
  if ((36 & this.f) == 32 || (this.f &= -5, this.g === et)) return !0;
  if (this.g = et, this.f |= 1, this.i > 0 && !Qn(this))
    return this.f &= -2, !0;
  var n = L;
  try {
    Zn(this), L = this;
    var t = this.x();
    (16 & this.f || this.v !== t || this.i === 0) && (this.v = t, this.f &= -17, this.i++);
  } catch (s) {
    this.v = s, this.f |= 16, this.i++;
  }
  return L = n, er(this), this.f &= -2, !0;
};
me.prototype.S = function(n) {
  if (this.t === void 0) {
    this.f |= 36;
    for (var t = this.s; t !== void 0; t = t.n) t.S.S(t);
  }
  W.prototype.S.call(this, n);
};
me.prototype.U = function(n) {
  if (this.t !== void 0 && (W.prototype.U.call(this, n), this.t === void 0)) {
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
  var n = Yn(this);
  if (this.h(), n !== void 0 && (n.i = this.i), 16 & this.f) throw this.v;
  return this.v;
} });
function tt(n, t) {
  return new me(n, t);
}
function tr(n) {
  var t = n.u;
  if (n.u = void 0, typeof t == "function") {
    ue++;
    var s = L;
    L = void 0;
    try {
      t();
    } catch (c) {
      throw n.f &= -2, n.f |= 8, Ht(n), c;
    } finally {
      L = s, ot();
    }
  }
}
function Ht(n) {
  for (var t = n.s; t !== void 0; t = t.n) t.S.U(t);
  n.x = void 0, n.s = void 0, tr(n);
}
function Ds(n) {
  if (L !== this) throw new Error("Out-of-order effect");
  er(this), L = n, this.f &= -2, 8 & this.f && Ht(this), ot();
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
  this.f |= 1, this.f &= -9, tr(this), Zn(this), ue++;
  var n = L;
  return L = this, Ds.bind(this, n);
};
xe.prototype.N = function() {
  2 & this.f || (this.f |= 2, this.o = Re, Re = this);
};
xe.prototype.d = function() {
  this.f |= 8, 1 & this.f || Ht(this);
};
xe.prototype.dispose = function() {
  this.d();
};
function De(n, t) {
  var s = new xe(n, t);
  try {
    s.c();
  } catch (l) {
    throw s.d(), l;
  }
  var c = s.d.bind(s);
  return c[Symbol.dispose] = c, c;
}
var nr, Je, Hs = typeof window < "u" && !!window.__PREACT_SIGNALS_DEVTOOLS__, rr = [];
De(function() {
  nr = this.N;
})();
function ke(n, t) {
  R[n] = t.bind(null, R[n] || function() {
  });
}
function nt(n) {
  if (Je) {
    var t = Je;
    Je = void 0, t();
  }
  Je = n && n.S();
}
function ir(n) {
  var t = this, s = n.data, c = sr(s);
  c.value = s;
  var l = Dt(function() {
    for (var f = t, _ = t.__v; _ = _.__; ) if (_.__c) {
      _.__c.__$f |= 4;
      break;
    }
    var v = tt(function() {
      var b = c.value.value;
      return b === 0 ? 0 : b === !0 ? "" : b || "";
    }), y = tt(function() {
      return !Array.isArray(v.value) && !$n(v.value);
    }), d = De(function() {
      if (this.N = or, y.value) {
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
ir.displayName = "ReactiveTextNode";
Object.defineProperties(W.prototype, { constructor: { configurable: !0, value: void 0 }, type: { configurable: !0, value: ir }, props: { configurable: !0, get: function() {
  return { data: this };
} }, __b: { configurable: !0, value: 1 } });
ke("__b", function(n, t) {
  if (typeof t.type == "string") {
    var s, c = t.props;
    for (var l in c) if (l !== "children") {
      var u = c[l];
      u instanceof W && (s || (t.__np = s = {}), s[l] = u, c[l] = u.peek());
    }
  }
  n(t);
});
ke("__r", function(n, t) {
  if (n(t), t.type !== le) {
    nt();
    var s, c = t.__c;
    c && (c.__$f &= -2, (s = c.__$u) === void 0 && (c.__$u = s = (function(l, u) {
      var h;
      return De(function() {
        h = this;
      }, { name: u }), h.c = l, h;
    })(function() {
      var l;
      Hs && ((l = s.y) == null || l.call(s)), c.__$f |= 1, c.setState({});
    }, typeof t.type == "function" ? t.type.displayName || t.type.name : ""))), nt(s);
  }
});
ke("__e", function(n, t, s, c) {
  nt(), n(t, s, c);
});
ke("diffed", function(n, t) {
  nt();
  var s;
  if (typeof t.type == "string" && (s = t.__e)) {
    var c = t.__np, l = t.props;
    if (c) {
      var u = s.U;
      if (u) for (var h in u) {
        var f = u[h];
        f !== void 0 && !(h in c) && (f.d(), u[h] = void 0);
      }
      else
        u = {}, s.U = u;
      for (var _ in c) {
        var v = u[_], y = c[_];
        v === void 0 ? (v = Ms(s, _, y), u[_] = v) : v.o(y, l);
      }
      for (var d in c) l[d] = c[d];
    }
  }
  n(t);
});
function Ms(n, t, s, c) {
  var l = t in n && n.ownerSVGElement === void 0, u = Z(s), h = s.peek();
  return { o: function(f, _) {
    u.value = f, h = f.peek();
  }, d: De(function() {
    this.N = or;
    var f = u.value.value;
    h !== f ? (h = void 0, l ? n[t] = f : f != null && (f !== !1 || t[4] === "-") ? n.setAttribute(t, f) : n.removeAttribute(t)) : h = void 0;
  }) };
}
ke("unmount", function(n, t) {
  if (typeof t.type == "string") {
    var s = t.__e;
    if (s) {
      var c = s.U;
      if (c) {
        s.U = void 0;
        for (var l in c) {
          var u = c[l];
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
ke("__h", function(n, t, s, c) {
  (c < 3 || c === 9) && (t.__$f |= 2), n(t, s, c);
});
Le.prototype.shouldComponentUpdate = function(n, t) {
  if (this.__R) return !0;
  var s = this.__$u, c = s && s.s !== void 0;
  for (var l in t) return !0;
  if (this.__f || typeof this.u == "boolean" && this.u === !0) {
    var u = 2 & this.__$f;
    if (!(c || u || 4 & this.__$f) || 1 & this.__$f) return !0;
  } else if (!(c || 4 & this.__$f) || 3 & this.__$f) return !0;
  for (var h in n) if (h !== "__source" && n[h] !== this.props[h]) return !0;
  for (var f in this.props) if (!(f in n)) return !0;
  return !1;
};
function sr(n, t) {
  return Dt(function() {
    return Z(n, t);
  }, []);
}
var js = function(n) {
  queueMicrotask(function() {
    queueMicrotask(n);
  });
};
function zs() {
  Us(function() {
    for (var n; n = rr.shift(); ) nr.call(n);
  });
}
function or() {
  rr.push(this) === 1 && (R.requestAnimationFrame || js)(zs);
}
const ee = Z(!1), Tn = Z(!1), G = Z([]), q = Z(null), he = Z(null), re = Z(null), de = Z(null), Ee = Z(""), Ne = Z(!1), rt = Z(!1), F = Z({
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
}), ar = Z(!1), qs = tt(
  () => F.value.requireEmail && !de.value && !q.value
), Bs = tt(() => !!q.value), cr = "guddesk_state";
function Mt() {
  try {
    localStorage.setItem(
      cr,
      JSON.stringify({
        conversationId: q.value,
        visitorId: he.value,
        visitorToken: re.value,
        visitorEmail: de.value
      })
    );
  } catch {
  }
}
function Fs() {
  try {
    const n = localStorage.getItem(cr);
    if (!n) return;
    const t = JSON.parse(n);
    t.conversationId && (q.value = t.conversationId), t.visitorId && (he.value = t.visitorId), t.visitorToken && (re.value = t.visitorToken), t.visitorEmail && (de.value = t.visitorEmail);
  } catch {
  }
}
function Ws(n, t, s) {
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
function Js(n) {
  const t = { ...n.extra };
  return n.hasBody && (t["Content-Type"] = "application/json"), n.visitorToken && (t["x-visitor-token"] = n.visitorToken), t;
}
let He = "", ur = "";
function Xs(n, t) {
  He = n, ur = t.replace(/\/$/, "");
}
async function Ce(n, t = {}) {
  const s = Js({
    hasBody: !!t.body,
    visitorToken: re.value,
    extra: t.headers
  }), c = await fetch(`${ur}${n}`, { ...t, headers: s });
  if (!c.ok) {
    const l = await c.json().catch(() => ({ error: "Request failed" }));
    throw new Error(l.error || "Request failed");
  }
  return c.json();
}
async function Gs() {
  const n = await Ce(
    `/api/widget/config?appId=${encodeURIComponent(He)}`
  );
  F.value = n, ar.value = !0;
}
async function Vs() {
  if (re.value && he.value) return;
  const n = await Ce(
    "/api/widget/auth",
    { method: "POST", body: JSON.stringify({ appId: He }) }
  );
  he.value = n.visitorId, re.value = n.visitorToken, Mt();
}
async function at(n) {
  const t = await Ce(
    "/api/widget/visitors",
    {
      method: "POST",
      body: JSON.stringify(
        Ws(He, re.value, n)
      )
    }
  );
  he.value = t.visitorId, re.value = t.visitorToken, n.email && (de.value = n.email), Mt();
}
let Ks = 0;
function lr(n) {
  const t = `_opt_${++Ks}`, s = {
    id: t,
    body: n,
    type: "VISITOR",
    senderName: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    _sending: !0
  };
  return G.value = [...G.value, s], t;
}
function Et(n, t) {
  t ? G.value = G.value.map((s) => s.id === n ? t : s) : G.value = G.value.map(
    (s) => s.id === n ? { ...s, _sending: !1 } : s
  );
}
async function Ys(n) {
  const t = lr(n);
  try {
    const s = await Ce("/api/widget/conversations", {
      method: "POST",
      body: JSON.stringify({
        appId: He,
        visitorToken: re.value,
        message: n,
        visitorName: null,
        visitorEmail: de.value
      })
    });
    q.value = s.conversationId, he.value = s.visitorId, re.value = s.visitorToken, G.value = s.messages, Mt();
  } catch {
    Et(t, null);
  }
}
async function Qs(n) {
  if (!q.value)
    return Ys(n);
  const t = lr(n);
  try {
    const s = await Ce(
      `/api/widget/conversations/${q.value}/messages`,
      { method: "POST", body: JSON.stringify({ message: n }) }
    );
    Et(t, s);
  } catch {
    Et(t, null);
  }
}
async function St() {
  if (!q.value) return;
  const n = await Ce(
    `/api/widget/conversations/${q.value}/messages`
  );
  G.value = n.messages;
}
const Zs = "https://www.guddesk.com", eo = /* @__PURE__ */ new Set([
  "cdn.guddesk.com",
  "www.guddesk.com",
  "guddesk.com"
]);
function to(n, t, s) {
  if (s)
    return s.replace(/\/$/, "");
  if (n)
    try {
      const c = new URL(n);
      if (eo.has(c.hostname))
        return Zs;
      if (c.hostname.includes("guddesk") || n.includes("widget"))
        return c.origin;
    } catch {
    }
  return t;
}
function no(n) {
  for (let t = n.length - 1; t >= 0; t--) {
    const s = n[t]?.src;
    if (s && (s.includes("guddesk") || s.includes("widget")))
      return s;
  }
}
const Pn = "#3ECF8E", ro = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, Xe = String.raw`(?:\d+(?:\.\d+)?|\.\d+)%?`, io = new RegExp(
  String.raw`^rgba?\(\s*${Xe}\s*,\s*${Xe}\s*,\s*${Xe}\s*(?:,\s*${Xe}\s*)?\)$`,
  "i"
);
function On(n) {
  if (typeof n != "string") return !1;
  const t = n.trim();
  return ro.test(t) || io.test(t);
}
function It(n, t = Pn) {
  return On(n) ? n.trim() : On(t) ? t.trim() : Pn;
}
const so = 440;
function An(n) {
  if (n == null || n === "") return;
  const t = n.trim().toLowerCase();
  if (t === "true" || t === "1") return !0;
  if (t === "false" || t === "0") return !1;
}
function oo(n) {
  const t = {}, s = n.getAttribute("data-app-id") || n.getAttribute("data-guddesk") || void 0;
  s && (t.appId = s);
  const c = n.getAttribute("data-base-url");
  c && (t.baseUrl = c);
  const l = An(n.getAttribute("data-open-on-load"));
  l !== void 0 && (t.openOnLoad = l);
  const u = An(n.getAttribute("data-hide-on-mobile"));
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
function ao(n, t) {
  return { ...n, ...t };
}
function co(n, t) {
  return {
    primaryColor: It(
      t.accentColor,
      It(n.primaryColor)
    ),
    position: t.position ?? n.position,
    welcomeMessage: t.greeting !== void 0 ? t.greeting : n.welcomeMessage
  };
}
function uo(n, t, s = so) {
  return !!n && t <= s;
}
function lo(n) {
  for (let t = n.length - 1; t >= 0; t--) {
    const s = n[t];
    if (s && (s.getAttribute("data-app-id") || s.getAttribute("data-guddesk") || s.src && (s.src.includes("widget.js") || s.src.includes("guddesk"))))
      return s;
  }
}
var ho = 0;
function k(n, t, s, c, l, u) {
  t || (t = {});
  var h, f, _ = t;
  if ("ref" in _) for (f in _ = {}, t) f == "ref" ? h = t[f] : _[f] = t[f];
  var v = { type: n, props: _, key: s, ref: h, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --ho, __i: -1, __u: 0, __source: l, __self: u };
  if (typeof n == "function" && (h = n.defaultProps)) for (f in h) _[f] === void 0 && (_[f] = h[f]);
  return R.vnode && R.vnode(v), v;
}
function fo(n) {
  const t = n.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/\*\*/g, "{{GLOBSTAR}}").replace(/\*/g, "[^/]*").replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${t}$`);
}
function po(n, t, s) {
  if (!s || s.length === 0) return !0;
  const c = s.some((l) => {
    try {
      return fo(l).test(n);
    } catch {
      return !1;
    }
  });
  return t === "exclude" ? !c : c;
}
let ne = null, te = null, ye = null;
const _o = 8e3;
async function vo(n, t, s) {
  const { default: c } = await Promise.resolve().then(() => qo), l = new c(n, {
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
    }, _o);
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
function En() {
  if (!ne || !q.value) return;
  te && (te.unbind_all(), ne.unsubscribe(te.name));
  const n = `private-visitor-${q.value}`;
  te = ne.subscribe(n), te.bind("message:created", (t) => {
    G.value.some((s) => s.id === t.id) || (G.value = [...G.value, t]);
  }), te.bind("typing:start", () => {
    Ne.value = !0, ye && clearTimeout(ye), ye = setTimeout(() => {
      Ne.value = !1;
    }, 4e3);
  }), te.bind("typing:stop", () => {
    Ne.value = !1, ye && (clearTimeout(ye), ye = null);
  });
}
function xt() {
  return ne?.connection?.state === "connected";
}
function go() {
  te && (te.unbind_all(), ne?.unsubscribe(te.name), te = null), ne && (ne.disconnect(), ne = null);
}
const mo = "guddesk_identified:";
function hr(n) {
  return `${mo}${n}`;
}
function dr(n) {
  return JSON.stringify([
    n.visitorId ?? "",
    n.userId ?? "",
    n.name ?? "",
    n.email ?? ""
  ]);
}
function bo(n, t, s) {
  if (!n) return !0;
  try {
    return n.getItem(hr(t)) !== dr(s);
  } catch {
    return !0;
  }
}
function yo(n, t, s) {
  if (n)
    try {
      n.setItem(hr(t), dr(s));
    } catch {
    }
}
function wo() {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
}
function So(n, t) {
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
const xo = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', ko = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', Co = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function To() {
  return /* @__PURE__ */ k("div", { class: "fc-header", style: { position: "relative" }, children: [
    /* @__PURE__ */ k("div", { class: "fc-header-title", children: F.value.workspaceName || "Support" }),
    /* @__PURE__ */ k("div", { class: "fc-header-subtitle", children: "We typically reply in a few minutes" }),
    /* @__PURE__ */ k(
      "button",
      {
        class: "fc-header-close",
        onClick: () => ee.value = !1,
        "aria-label": "Close chat",
        dangerouslySetInnerHTML: { __html: ko }
      }
    )
  ] });
}
function Po(n) {
  try {
    return new Date(n).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function In() {
  const n = we(null);
  return Ie(() => {
    n.current?.scrollIntoView({ behavior: "smooth" });
  }, [G.value.length, Ne.value]), Bs.value ? /* @__PURE__ */ k("div", { class: "fc-messages", children: [
    G.value.map((t) => /* @__PURE__ */ k(
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
                ] }) : Po(t.createdAt) })
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
function Oo() {
  const n = we(null);
  async function t() {
    const c = Ee.value.trim();
    !c || Tn.value || (Ee.value = "", await Qs(c), n.current?.focus());
  }
  function s(c) {
    c.key === "Enter" && !c.shiftKey && (c.preventDefault(), t());
  }
  return /* @__PURE__ */ k("div", { class: "fc-input-area", children: [
    /* @__PURE__ */ k(
      "textarea",
      {
        ref: n,
        class: "fc-input",
        rows: 1,
        placeholder: "Type a message...",
        value: Ee.value,
        onInput: (c) => {
          Ee.value = c.target.value;
        },
        onKeyDown: s
      }
    ),
    /* @__PURE__ */ k(
      "button",
      {
        class: "fc-send-btn",
        onClick: t,
        disabled: !Ee.value.trim() || Tn.value,
        children: "Send"
      }
    )
  ] });
}
function Ao() {
  const [n, t] = ae(""), [s, c] = ae(""), [l, u] = ae(!1);
  async function h(f) {
    f.preventDefault();
    const _ = n.trim();
    if (!_ || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_)) {
      c("Please enter a valid email address.");
      return;
    }
    u(!0), c("");
    try {
      await at({ email: _ }), de.value = _;
    } catch {
      c("Something went wrong. Please try again.");
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
function Eo() {
  const [n, t] = ae(""), [s, c] = ae(de.value ?? ""), [l, u] = ae(""), [h, f] = ae(!1), [_, v] = ae(!1), [y, d] = ae("");
  async function S(T) {
    T.preventDefault();
    const C = s.trim();
    if (!C || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(C)) {
      d("Please enter a valid email address.");
      return;
    }
    v(!0), d("");
    try {
      await at({
        email: C,
        name: n.trim() || void 0
      }), de.value = C, f(!0);
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
            onInput: (T) => c(T.target.value),
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
function Io() {
  return /* @__PURE__ */ k("div", { class: "fc-window", children: [
    /* @__PURE__ */ k(To, {}),
    qs.value ? /* @__PURE__ */ k(Ao, {}) : rt.value ? /* @__PURE__ */ k(le, { children: [
      /* @__PURE__ */ k(In, {}),
      /* @__PURE__ */ k(Eo, {})
    ] }) : /* @__PURE__ */ k(le, { children: [
      /* @__PURE__ */ k(In, {}),
      /* @__PURE__ */ k(Oo, {})
    ] }),
    F.value.showBranding && /* @__PURE__ */ k("div", { class: "fc-branding", children: [
      "Powered by",
      " ",
      /* @__PURE__ */ k("a", { href: "https://guddesk.com", target: "_blank", rel: "noopener", children: "GudDesk" })
    ] })
  ] });
}
function Lo() {
  return /* @__PURE__ */ k(
    "button",
    {
      class: "fc-bubble",
      onClick: () => ee.value = !ee.value,
      "aria-label": ee.value ? "Close chat" : "Open chat",
      dangerouslySetInnerHTML: {
        __html: ee.value ? Co : xo
      }
    }
  );
}
const Ro = 4e3;
function No({
  appId: n,
  baseUrl: t,
  pusherKey: s,
  pusherCluster: c,
  snippet: l = {}
}) {
  const u = we(null), h = we(!1), f = we(null), _ = we(0), v = sr(!1);
  function y() {
    d(), u.current = setInterval(() => {
      q.value && ee.value && St().catch(() => {
      });
    }, Ro);
  }
  function d() {
    u.current && (clearInterval(u.current), u.current = null);
  }
  async function S(b, T) {
    if (!h.current) {
      h.current = !0;
      try {
        await vo(b, T, `${t}/api/pusher/auth`), q.value && En(), d();
      } catch {
        h.current = !1, y();
      }
    }
  }
  return Ie(() => (Fs(), Xs(n, t), Promise.all([
    Gs().catch(() => {
    }),
    Vs().catch(() => {
    })
  ]).then(() => {
    const b = co(F.value, l);
    if (F.value = { ...F.value, ...b }, !po(
      window.location.pathname,
      F.value.pageVisibilityMode,
      F.value.pageVisibilityPatterns
    ) || uo(l.hideOnMobile, window.innerWidth)) {
      v.value = !0;
      return;
    }
    if (l.openOnLoad && (ee.value = !0), l.name || l.email) {
      const m = wo(), x = { name: l.name, email: l.email };
      bo(m, n, {
        ...x,
        visitorId: he.value
      }) && at(x).then(() => {
        yo(m, n, {
          ...x,
          visitorId: he.value
        });
      }).catch(() => {
      });
    }
    q.value && St().catch(() => {
    });
    const C = s || F.value.pusherKey, g = c || F.value.pusherCluster;
    C && g ? S(C, g) : y();
  }), () => {
    go(), d();
  }), []), Ie(() => {
    q.value && (xt() ? En() : u.current || y());
  }, [q.value]), Ie(() => {
    ee.value && q.value && !xt() ? (St().catch(() => {
    }), y()) : !ee.value && !xt() && d();
  }, [ee.value]), Ie(() => {
    const b = F.value.offlineFormTimeout;
    if (!b || !q.value) return;
    const T = G.value, C = T.filter((m) => m.type === "VISITOR").length;
    if (T.some((m) => m.type === "AGENT" || m.type === "BOT")) {
      rt.value = !1, f.current && (clearTimeout(f.current), f.current = null), _.current = C;
      return;
    }
    return C > _.current && (_.current = C, f.current && clearTimeout(f.current), f.current = setTimeout(() => {
      G.value.some((E) => E.type === "AGENT" || E.type === "BOT") || (rt.value = !0);
    }, b * 60 * 1e3)), () => {
      f.current && (clearTimeout(f.current), f.current = null);
    };
  }, [G.value, q.value, F.value.offlineFormTimeout]), !ar.value || v.value ? null : /* @__PURE__ */ k(le, { children: [
    /* @__PURE__ */ k("style", { children: So(It(F.value.primaryColor), F.value.position) }),
    /* @__PURE__ */ k("div", { class: "fc-container", children: [
      ee.value && /* @__PURE__ */ k(Io, {}),
      /* @__PURE__ */ k(Lo, {})
    ] })
  ] });
}
let $e = null;
function $o(n) {
  const t = Array.from(document.querySelectorAll("script[src]")).map(
    (s) => ({ src: s.src })
  );
  return to(
    no(t),
    window.location.origin,
    n
  );
}
function Uo() {
  const n = Array.from(document.querySelectorAll("script")), t = lo(
    n.map((l) => l)
  ), s = t ? oo(t) : {}, c = ao(s, window.GudDeskSettings);
  return c.appId ? c : null;
}
function fr(n) {
  if ($e) return;
  const t = n.appId;
  if (!t) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }
  const s = $o(n.baseUrl), c = document.createElement("div");
  c.id = "guddesk-widget", document.body.appendChild(c), $e = c.attachShadow({ mode: "open" }), Jn(
    Mn(No, {
      appId: t,
      baseUrl: s,
      pusherKey: n.pusherKey,
      pusherCluster: n.pusherCluster,
      snippet: n
    }),
    $e
  );
}
function Do() {
  const n = document.getElementById("guddesk-widget");
  n && (Jn(null, $e), n.remove(), $e = null);
}
function Ln() {
  const n = Uo();
  n && fr(n);
}
const Ho = {
  init: fr,
  identify: (n) => at(n),
  open: () => {
    ee.value = !0;
  },
  close: () => {
    ee.value = !1;
  },
  destroy: Do
};
window.GudDesk = Ho;
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Ln) : Ln();
function Mo(n) {
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
var Rn;
function jo() {
  return Rn || (Rn = 1, (function(n, t) {
    (function(c, l) {
      n.exports = l();
    })(window, function() {
      return (
        /******/
        (function(s) {
          var c = {};
          function l(u) {
            if (c[u])
              return c[u].exports;
            var h = c[u] = {
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
          return l.m = s, l.c = c, l.d = function(u, h, f) {
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
          (function(s, c, l) {
            var u = this && this.__extends || /* @__PURE__ */ (function() {
              var C = function(g, m) {
                return C = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(x, E) {
                  x.__proto__ = E;
                } || function(x, E) {
                  for (var $ in E) E.hasOwnProperty($) && (x[$] = E[$]);
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
            Object.defineProperty(c, "__esModule", { value: !0 });
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
                    var E = g[x] << 16 | g[x + 1] << 8 | g[x + 2];
                    m += this._encodeByte(E >>> 18 & 63), m += this._encodeByte(E >>> 12 & 63), m += this._encodeByte(E >>> 6 & 63), m += this._encodeByte(E >>> 0 & 63);
                  }
                  var $ = g.length - x;
                  if ($ > 0) {
                    var E = g[x] << 16 | ($ === 2 ? g[x + 1] << 8 : 0);
                    m += this._encodeByte(E >>> 18 & 63), m += this._encodeByte(E >>> 12 & 63), $ === 2 ? m += this._encodeByte(E >>> 6 & 63) : m += this._paddingCharacter || "", m += this._paddingCharacter || "";
                  }
                  return m;
                }, C.prototype.maxDecodedLength = function(g) {
                  return this._paddingCharacter ? g / 4 * 3 | 0 : (g * 6 + 7) / 8 | 0;
                }, C.prototype.decodedLength = function(g) {
                  return this.maxDecodedLength(g.length - this._getPaddingLength(g));
                }, C.prototype.decode = function(g) {
                  if (g.length === 0)
                    return new Uint8Array(0);
                  for (var m = this._getPaddingLength(g), x = g.length - m, E = new Uint8Array(this.maxDecodedLength(x)), $ = 0, D = 0, K = 0, Y = 0, J = 0, M = 0, V = 0; D < x - 4; D += 4)
                    Y = this._decodeChar(g.charCodeAt(D + 0)), J = this._decodeChar(g.charCodeAt(D + 1)), M = this._decodeChar(g.charCodeAt(D + 2)), V = this._decodeChar(g.charCodeAt(D + 3)), E[$++] = Y << 2 | J >>> 4, E[$++] = J << 4 | M >>> 2, E[$++] = M << 6 | V, K |= Y & h, K |= J & h, K |= M & h, K |= V & h;
                  if (D < x - 1 && (Y = this._decodeChar(g.charCodeAt(D)), J = this._decodeChar(g.charCodeAt(D + 1)), E[$++] = Y << 2 | J >>> 4, K |= Y & h, K |= J & h), D < x - 2 && (M = this._decodeChar(g.charCodeAt(D + 2)), E[$++] = J << 4 | M >>> 2, K |= M & h), D < x - 3 && (V = this._decodeChar(g.charCodeAt(D + 3)), E[$++] = M << 6 | V, K |= V & h), K !== 0)
                    throw new Error("Base64Coder: incorrect characters for decoding");
                  return E;
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
            c.Coder = f;
            var _ = new f();
            function v(C) {
              return _.encode(C);
            }
            c.encode = v;
            function y(C) {
              return _.decode(C);
            }
            c.decode = y;
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
            c.URLSafeCoder = d;
            var S = new d();
            function b(C) {
              return S.encode(C);
            }
            c.encodeURLSafe = b;
            function T(C) {
              return S.decode(C);
            }
            c.decodeURLSafe = T, c.encodedLength = function(C) {
              return _.encodedLength(C);
            }, c.maxDecodedLength = function(C) {
              return _.maxDecodedLength(C);
            }, c.decodedLength = function(C) {
              return _.decodedLength(C);
            };
          }),
          /* 1 */
          /***/
          (function(s, c, l) {
            Object.defineProperty(c, "__esModule", { value: !0 });
            var u = "utf8: invalid string", h = "utf8: invalid source encoding";
            function f(y) {
              for (var d = new Uint8Array(_(y)), S = 0, b = 0; b < y.length; b++) {
                var T = y.charCodeAt(b);
                T < 128 ? d[S++] = T : T < 2048 ? (d[S++] = 192 | T >> 6, d[S++] = 128 | T & 63) : T < 55296 ? (d[S++] = 224 | T >> 12, d[S++] = 128 | T >> 6 & 63, d[S++] = 128 | T & 63) : (b++, T = (T & 1023) << 10, T |= y.charCodeAt(b) & 1023, T += 65536, d[S++] = 240 | T >> 18, d[S++] = 128 | T >> 12 & 63, d[S++] = 128 | T >> 6 & 63, d[S++] = 128 | T & 63);
              }
              return d;
            }
            c.encode = f;
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
            c.encodedLength = _;
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
            c.decode = v;
          }),
          /* 2 */
          /***/
          (function(s, c, l) {
            s.exports = l(3).default;
          }),
          /* 3 */
          /***/
          (function(s, c, l) {
            l.r(c);
            class u {
              constructor(e, r) {
                this.lastId = 0, this.prefix = e, this.name = r;
              }
              create(e) {
                this.lastId++;
                var r = this.lastId, o = this.prefix + r, a = this.name + "[" + r + "]", p = !1, w = function() {
                  p || (e.apply(null, arguments), p = !0);
                };
                return this[r] = w, { number: r, id: o, name: a, callback: w };
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
                var a = this;
                if (a.loading[e] && a.loading[e].length > 0)
                  a.loading[e].push(o);
                else {
                  a.loading[e] = [o];
                  var p = A.createScriptRequest(a.getPath(e, r)), w = a.receivers.create(function(P) {
                    if (a.receivers.remove(w), a.loading[e]) {
                      var O = a.loading[e];
                      delete a.loading[e];
                      for (var I = function(j) {
                        j || p.cleanup();
                      }, N = 0; N < O.length; N++)
                        O[N](P, I);
                    }
                  });
                  p.send(w);
                }
              }
              getRoot(e) {
                var r, o = A.getDocument().location.protocol;
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
            class E extends Error {
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
            class J extends Error {
              constructor(e, r) {
                super(r), this.status = e, Object.setPrototypeOf(this, new.target.prototype);
              }
            }
            var V = function(i, e, r, o, a) {
              const p = A.createXHR();
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
                    let P, O = !1;
                    try {
                      P = JSON.parse(p.responseText), O = !0;
                    } catch {
                      a(new J(200, `JSON returned from ${o.toString()} endpoint was invalid, yet status code was 200. Data was: ${p.responseText}`), null);
                    }
                    O && a(null, P);
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
                    a(new J(p.status, `Unable to retrieve auth string from ${o.toString()} endpoint - received status: ${p.status} from ${r.endpoint}. ${P}`), null);
                  }
              }, p.send(e), p;
            };
            function _r(i) {
              return br(gr(i));
            }
            var Te = String.fromCharCode, Me = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", vr = function(i) {
              var e = i.charCodeAt(0);
              return e < 128 ? i : e < 2048 ? Te(192 | e >>> 6) + Te(128 | e & 63) : Te(224 | e >>> 12 & 15) + Te(128 | e >>> 6 & 63) + Te(128 | e & 63);
            }, gr = function(i) {
              return i.replace(/[^\x00-\x7F]/g, vr);
            }, mr = function(i) {
              var e = [0, 2, 1][i.length % 3], r = i.charCodeAt(0) << 16 | (i.length > 1 ? i.charCodeAt(1) : 0) << 8 | (i.length > 2 ? i.charCodeAt(2) : 0), o = [
                Me.charAt(r >>> 18),
                Me.charAt(r >>> 12 & 63),
                e >= 2 ? "=" : Me.charAt(r >>> 6 & 63),
                e >= 1 ? "=" : Me.charAt(r & 63)
              ];
              return o.join("");
            }, br = window.btoa || function(i) {
              return i.replace(/[\s\S]{1,3}/g, mr);
            };
            class yr {
              constructor(e, r, o, a) {
                this.clear = r, this.timer = e(() => {
                  this.timer && (this.timer = a(this.timer));
                }, o);
              }
              isRunning() {
                return this.timer !== null;
              }
              ensureAborted() {
                this.timer && (this.clear(this.timer), this.timer = null);
              }
            }
            var jt = yr;
            function wr(i) {
              window.clearTimeout(i);
            }
            function Sr(i) {
              window.clearInterval(i);
            }
            class fe extends jt {
              constructor(e, r) {
                super(setTimeout, wr, e, function(o) {
                  return r(), null;
                });
              }
            }
            class xr extends jt {
              constructor(e, r) {
                super(setInterval, Sr, e, function(o) {
                  return r(), o;
                });
              }
            }
            var kr = {
              now() {
                return Date.now ? Date.now() : (/* @__PURE__ */ new Date()).valueOf();
              },
              defer(i) {
                return new fe(0, i);
              },
              method(i, ...e) {
                var r = Array.prototype.slice.call(arguments, 1);
                return function(o) {
                  return o[i].apply(o, r.concat(arguments));
                };
              }
            }, X = kr;
            function Q(i, ...e) {
              for (var r = 0; r < e.length; r++) {
                var o = e[r];
                for (var a in o)
                  o[a] && o[a].constructor && o[a].constructor === Object ? i[a] = Q(i[a] || {}, o[a]) : i[a] = o[a];
              }
              return i;
            }
            function Cr() {
              for (var i = ["Pusher"], e = 0; e < arguments.length; e++)
                typeof arguments[e] == "string" ? i.push(arguments[e]) : i.push(je(arguments[e]));
              return i.join(" : ");
            }
            function zt(i, e) {
              var r = Array.prototype.indexOf;
              if (i === null)
                return -1;
              if (r && i.indexOf === r)
                return i.indexOf(e);
              for (var o = 0, a = i.length; o < a; o++)
                if (i[o] === e)
                  return o;
              return -1;
            }
            function ie(i, e) {
              for (var r in i)
                Object.prototype.hasOwnProperty.call(i, r) && e(i[r], r, i);
            }
            function qt(i) {
              var e = [];
              return ie(i, function(r, o) {
                e.push(o);
              }), e;
            }
            function Tr(i) {
              var e = [];
              return ie(i, function(r) {
                e.push(r);
              }), e;
            }
            function Pe(i, e, r) {
              for (var o = 0; o < i.length; o++)
                e.call(r || window, i[o], o, i);
            }
            function Bt(i, e) {
              for (var r = [], o = 0; o < i.length; o++)
                r.push(e(i[o], o, i, r));
              return r;
            }
            function Pr(i, e) {
              var r = {};
              return ie(i, function(o, a) {
                r[a] = e(o);
              }), r;
            }
            function Ft(i, e) {
              e = e || function(a) {
                return !!a;
              };
              for (var r = [], o = 0; o < i.length; o++)
                e(i[o], o, i, r) && r.push(i[o]);
              return r;
            }
            function Wt(i, e) {
              var r = {};
              return ie(i, function(o, a) {
                (e && e(o, a, i, r) || o) && (r[a] = o);
              }), r;
            }
            function Or(i) {
              var e = [];
              return ie(i, function(r, o) {
                e.push([o, r]);
              }), e;
            }
            function Jt(i, e) {
              for (var r = 0; r < i.length; r++)
                if (e(i[r], r, i))
                  return !0;
              return !1;
            }
            function Ar(i, e) {
              for (var r = 0; r < i.length; r++)
                if (!e(i[r], r, i))
                  return !1;
              return !0;
            }
            function Er(i) {
              return Pr(i, function(e) {
                return typeof e == "object" && (e = je(e)), encodeURIComponent(_r(e.toString()));
              });
            }
            function Ir(i) {
              var e = Wt(i, function(o) {
                return o !== void 0;
              }), r = Bt(Or(Er(e)), X.method("join", "=")).join("&");
              return r;
            }
            function Lr(i) {
              var e = [], r = [];
              return (function o(a, p) {
                var w, P, O;
                switch (typeof a) {
                  case "object":
                    if (!a)
                      return null;
                    for (w = 0; w < e.length; w += 1)
                      if (e[w] === a)
                        return { $ref: r[w] };
                    if (e.push(a), r.push(p), Object.prototype.toString.apply(a) === "[object Array]")
                      for (O = [], w = 0; w < a.length; w += 1)
                        O[w] = o(a[w], p + "[" + w + "]");
                    else {
                      O = {};
                      for (P in a)
                        Object.prototype.hasOwnProperty.call(a, P) && (O[P] = o(a[P], p + "[" + JSON.stringify(P) + "]"));
                    }
                    return O;
                  case "number":
                  case "string":
                  case "boolean":
                    return a;
                }
              })(i, "$");
            }
            function je(i) {
              try {
                return JSON.stringify(i);
              } catch {
                return JSON.stringify(Lr(i));
              }
            }
            class Rr {
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
                var o = Cr.apply(this, arguments);
                mt.log ? mt.log(o) : mt.logToConsole && e.bind(this)(o);
              }
            }
            var U = new Rr(), Nr = function(i, e, r, o, a) {
              (r.headers !== void 0 || r.headersProvider != null) && U.warn(`To send headers with the ${o.toString()} request, you must use AJAX, rather than JSONP.`);
              var p = i.nextAuthCallbackID.toString();
              i.nextAuthCallbackID++;
              var w = i.getDocument(), P = w.createElement("script");
              i.auth_callbacks[p] = function(N) {
                a(null, N);
              };
              var O = "Pusher.auth_callbacks['" + p + "']";
              P.src = r.endpoint + "?callback=" + encodeURIComponent(O) + "&" + e;
              var I = w.getElementsByTagName("head")[0] || w.documentElement;
              I.insertBefore(P, I.firstChild);
            }, $r = Nr;
            class Ur {
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
                var a = document.getElementsByTagName("head")[0];
                a.insertBefore(r.script, a.firstChild), r.errorScript && a.insertBefore(r.errorScript, r.script.nextSibling);
              }
              cleanup() {
                this.script && (this.script.onload = this.script.onerror = null, this.script.onreadystatechange = null), this.script && this.script.parentNode && this.script.parentNode.removeChild(this.script), this.errorScript && this.errorScript.parentNode && this.errorScript.parentNode.removeChild(this.errorScript), this.script = null, this.errorScript = null;
              }
            }
            class Dr {
              constructor(e, r) {
                this.url = e, this.data = r;
              }
              send(e) {
                if (!this.request) {
                  var r = Ir(this.data), o = this.url + "/" + e.number + "?" + r;
                  this.request = A.createScriptRequest(o), this.request.send(e);
                }
              }
              cleanup() {
                this.request && this.request.cleanup();
              }
            }
            var Hr = function(i, e) {
              return function(r, o) {
                var a = "http" + (e ? "s" : "") + "://", p = a + (i.host || i.options.host) + i.options.path, w = A.createJSONPRequest(p, r), P = A.ScriptReceivers.create(function(O, I) {
                  h.remove(P), w.cleanup(), I && I.host && (i.host = I.host), o && o(O, I);
                });
                w.send(P);
              };
            }, Mr = {
              name: "jsonp",
              getAgent: Hr
            }, jr = Mr;
            function ct(i, e, r) {
              var o = i + (e.useTLS ? "s" : ""), a = e.useTLS ? e.hostTLS : e.hostNonTLS;
              return o + "://" + a + r;
            }
            function ut(i, e) {
              var r = "/app/" + i, o = "?protocol=" + _.PROTOCOL + "&client=js&version=" + _.VERSION + (e ? "&" + e : "");
              return r + o;
            }
            var zr = {
              getInitial: function(i, e) {
                var r = (e.httpPath || "") + ut(i, "flash=false");
                return ct("ws", e, r);
              }
            }, qr = {
              getInitial: function(i, e) {
                var r = (e.httpPath || "/pusher") + ut(i);
                return ct("http", e, r);
              }
            }, Br = {
              getInitial: function(i, e) {
                return ct("http", e, e.httpPath || "/pusher");
              },
              getPath: function(i, e) {
                return ut(i);
              }
            };
            class Fr {
              constructor() {
                this._callbacks = {};
              }
              get(e) {
                return this._callbacks[lt(e)];
              }
              add(e, r, o) {
                var a = lt(e);
                this._callbacks[a] = this._callbacks[a] || [], this._callbacks[a].push({
                  fn: r,
                  context: o
                });
              }
              remove(e, r, o) {
                if (!e && !r && !o) {
                  this._callbacks = {};
                  return;
                }
                var a = e ? [lt(e)] : qt(this._callbacks);
                r || o ? this.removeCallback(a, r, o) : this.removeAllCallbacks(a);
              }
              removeCallback(e, r, o) {
                Pe(e, function(a) {
                  this._callbacks[a] = Ft(this._callbacks[a] || [], function(p) {
                    return r && r !== p.fn || o && o !== p.context;
                  }), this._callbacks[a].length === 0 && delete this._callbacks[a];
                }, this);
              }
              removeAllCallbacks(e) {
                Pe(e, function(r) {
                  delete this._callbacks[r];
                }, this);
              }
            }
            function lt(i) {
              return "_" + i;
            }
            class se {
              constructor(e) {
                this.callbacks = new Fr(), this.global_callbacks = [], this.failThrough = e;
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
                return e ? (this.global_callbacks = Ft(this.global_callbacks || [], (r) => r !== e), this) : (this.global_callbacks = [], this);
              }
              unbind_all() {
                return this.unbind(), this.unbind_global(), this;
              }
              emit(e, r, o) {
                for (var a = 0; a < this.global_callbacks.length; a++)
                  this.global_callbacks[a](e, r);
                var p = this.callbacks.get(e), w = [];
                if (o ? w.push(r, o) : r && w.push(r), p && p.length > 0)
                  for (var a = 0; a < p.length; a++)
                    p[a].fn.apply(p[a].context || window, w);
                else this.failThrough && this.failThrough(e, r);
                return this;
              }
            }
            class Wr extends se {
              constructor(e, r, o, a, p) {
                super(), this.initialize = A.transportConnectionInitializer, this.hooks = e, this.name = r, this.priority = o, this.key = a, this.options = p, this.state = "new", this.timeline = p.timeline, this.activityTimeout = p.activityTimeout, this.id = this.timeline.generateUniqueID();
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
              createConnection(e, r, o, a) {
                return new Wr(this.hooks, e, r, o, a);
              }
            }
            var Jr = new be({
              urls: zr,
              handlesActivityChecks: !1,
              supportsPing: !1,
              isInitialized: function() {
                return !!A.getWebSocketAPI();
              },
              isSupported: function() {
                return !!A.getWebSocketAPI();
              },
              getSocket: function(i) {
                return A.createWebSocket(i);
              }
            }), Xt = {
              urls: qr,
              handlesActivityChecks: !1,
              supportsPing: !0,
              isInitialized: function() {
                return !0;
              }
            }, Gt = Q({
              getSocket: function(i) {
                return A.HTTPFactory.createStreamingSocket(i);
              }
            }, Xt), Vt = Q({
              getSocket: function(i) {
                return A.HTTPFactory.createPollingSocket(i);
              }
            }, Xt), Kt = {
              isSupported: function() {
                return A.isXHRSupported();
              }
            }, Xr = new be(Q({}, Gt, Kt)), Gr = new be(Q({}, Vt, Kt)), Vr = {
              ws: Jr,
              xhr_streaming: Xr,
              xhr_polling: Gr
            }, ze = Vr, Kr = new be({
              file: "sockjs",
              urls: Br,
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
            }), Yt = {
              isSupported: function(i) {
                var e = A.isXDRSupported(i.useTLS);
                return e;
              }
            }, Yr = new be(Q({}, Gt, Yt)), Qr = new be(Q({}, Vt, Yt));
            ze.xdr_streaming = Yr, ze.xdr_polling = Qr, ze.sockjs = Kr;
            var Zr = ze;
            class ei extends se {
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
            var ti = new ei();
            class ni {
              constructor(e, r, o) {
                this.manager = e, this.transport = r, this.minPingDelay = o.minPingDelay, this.maxPingDelay = o.maxPingDelay, this.pingDelay = void 0;
              }
              createConnection(e, r, o, a) {
                a = Q({}, a, {
                  activityTimeout: this.pingDelay
                });
                var p = this.transport.createConnection(e, r, o, a), w = null, P = function() {
                  p.unbind("open", P), p.bind("closed", O), w = X.now();
                }, O = (I) => {
                  if (p.unbind("closed", O), I.code === 1002 || I.code === 1003)
                    this.manager.reportDeath();
                  else if (!I.wasClean && w) {
                    var N = X.now() - w;
                    N < 2 * this.maxPingDelay && (this.manager.reportDeath(), this.pingDelay = Math.max(N / 2, this.minPingDelay));
                  }
                };
                return p.bind("open", P), p;
              }
              isSupported(e) {
                return this.manager.isAlive() && this.transport.isSupported(e);
              }
            }
            const Qt = {
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
                } catch (a) {
                  throw { type: "MessageParseError", error: a, data: i.data };
                }
              },
              encodeMessage: function(i) {
                return JSON.stringify(i);
              },
              processHandshake: function(i) {
                var e = Qt.decodeMessage(i);
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
            var pe = Qt;
            class ri extends se {
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
                var a = { event: e, data: r };
                return o && (a.channel = o), U.debug("Event sent", a), this.send(pe.encodeMessage(a));
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
                    var a;
                    try {
                      a = pe.decodeMessage(o);
                    } catch (p) {
                      this.emit("error", {
                        type: "MessageParseError",
                        error: p,
                        data: o.data
                      });
                    }
                    if (a !== void 0) {
                      switch (U.debug("Event recd", a), a.event) {
                        case "pusher:error":
                          this.emit("error", {
                            type: "PusherError",
                            data: a.data
                          });
                          break;
                        case "pusher:ping":
                          this.emit("ping");
                          break;
                        case "pusher:pong":
                          this.emit("pong");
                          break;
                      }
                      this.emit("message", a);
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
                  ie(e, (o, a) => {
                    this.transport.unbind(a, o);
                  });
                };
                ie(e, (o, a) => {
                  this.transport.bind(a, o);
                });
              }
              handleCloseEvent(e) {
                var r = pe.getCloseAction(e), o = pe.getCloseError(e);
                o && this.emit("error", o), r && this.emit(r, { action: r, error: o });
              }
            }
            class ii {
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
                    r = pe.processHandshake(e);
                  } catch (o) {
                    this.finish("error", { error: o }), this.transport.close();
                    return;
                  }
                  r.action === "connected" ? this.finish("connected", {
                    connection: new ri(r.id, this.transport),
                    activityTimeout: r.activityTimeout
                  }) : (this.finish(r.action, { error: r.error }), this.transport.close());
                }, this.onClosed = (e) => {
                  this.unbindListeners();
                  var r = pe.getCloseAction(e) || "backoff", o = pe.getCloseError(e);
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
            class si {
              constructor(e, r) {
                this.timeline = e, this.options = r || {};
              }
              send(e, r) {
                this.timeline.isEmpty() || this.timeline.send(A.TimelineTransport.getAgent(this, e), r);
              }
            }
            class ht extends se {
              constructor(e, r) {
                super(function(o, a) {
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
                  var a = {};
                  this.emit(r, o, a);
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
            class dt extends ht {
              authorize(e, r) {
                return this.pusher.config.channelAuthorizer({
                  channelName: this.name,
                  socketId: e
                }, r);
              }
            }
            class oi {
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
            var ai = function(i, e, r, o) {
              function a(p) {
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
                function O(N) {
                  try {
                    I(o.throw(N));
                  } catch (j) {
                    w(j);
                  }
                }
                function I(N) {
                  N.done ? p(N.value) : a(N.value).then(P, O);
                }
                I((o = o.apply(i, e || [])).next());
              });
            };
            class ci extends dt {
              constructor(e, r) {
                super(e, r), this.members = new oi();
              }
              authorize(e, r) {
                super.authorize(e, (o, a) => ai(this, void 0, void 0, function* () {
                  if (!o)
                    if (a = a, a.channel_data != null) {
                      var p = JSON.parse(a.channel_data);
                      this.members.setMyID(p.user_id);
                    } else if (yield this.pusher.user.signinDonePromise, this.pusher.user.user_data != null)
                      this.members.setMyID(this.pusher.user.user_data.id);
                    else {
                      let w = T.buildLogSuffix("authorizationEndpoint");
                      U.error(`Invalid auth response for channel '${this.name}', expected 'channel_data' field. ${w}, or the user should be signed in.`), r("Invalid auth response");
                      return;
                    }
                  r(o, a);
                }));
              }
              handleEvent(e) {
                var r = e.event;
                if (r.indexOf("pusher_internal:") === 0)
                  this.handleInternalEvent(e);
                else {
                  var o = e.data, a = {};
                  e.user_id && (a.user_id = e.user_id), this.emit(r, o, a);
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
                    var a = this.members.addMember(o);
                    this.emit("pusher:member_added", a);
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
            var ui = l(1), ft = l(0);
            class li extends dt {
              constructor(e, r, o) {
                super(e, r), this.key = null, this.nacl = o;
              }
              authorize(e, r) {
                super.authorize(e, (o, a) => {
                  if (o) {
                    r(o, a);
                    return;
                  }
                  let p = a.shared_secret;
                  if (!p) {
                    r(new Error(`No shared_secret key in auth payload for encrypted channel: ${this.name}`), null);
                    return;
                  }
                  this.key = Object(ft.decode)(p), delete a.shared_secret, r(null, a);
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
                let o = Object(ft.decode)(r.ciphertext);
                if (o.length < this.nacl.secretbox.overheadLength) {
                  U.error(`Expected encrypted event ciphertext length to be ${this.nacl.secretbox.overheadLength}, got: ${o.length}`);
                  return;
                }
                let a = Object(ft.decode)(r.nonce);
                if (a.length < this.nacl.secretbox.nonceLength) {
                  U.error(`Expected encrypted event nonce length to be ${this.nacl.secretbox.nonceLength}, got: ${a.length}`);
                  return;
                }
                let p = this.nacl.secretbox.open(o, a, this.key);
                if (p === null) {
                  U.debug("Failed to decrypt an event, probably because it was encrypted with a different key. Fetching a new key from the authEndpoint..."), this.authorize(this.pusher.connection.socket_id, (w, P) => {
                    if (w) {
                      U.error(`Failed to make a request to the authEndpoint: ${P}. Unable to fetch new key, so dropping encrypted event`);
                      return;
                    }
                    if (p = this.nacl.secretbox.open(o, a, this.key), p === null) {
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
                let r = Object(ui.decode)(e);
                try {
                  return JSON.parse(r);
                } catch {
                  return r;
                }
              }
            }
            class hi extends se {
              constructor(e, r) {
                super(), this.state = "initialized", this.connection = null, this.key = e, this.options = r, this.timeline = this.options.timeline, this.usingTLS = this.options.useTLS, this.errorCallbacks = this.buildErrorCallbacks(), this.connectionCallbacks = this.buildConnectionCallbacks(this.errorCallbacks), this.handshakeCallbacks = this.buildHandshakeCallbacks(this.errorCallbacks);
                var o = A.getNetwork();
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
                this.timeline.info({ action: "retry", delay: e }), e > 0 && this.emit("connecting_in", Math.round(e / 1e3)), this.retryTimer = new fe(e || 0, () => {
                  this.disconnectInternally(), this.connect();
                });
              }
              clearRetryTimer() {
                this.retryTimer && (this.retryTimer.ensureAborted(), this.retryTimer = null);
              }
              setUnavailableTimer() {
                this.unavailableTimer = new fe(this.options.unavailableTimeout, () => {
                  this.updateState("unavailable");
                });
              }
              clearUnavailableTimer() {
                this.unavailableTimer && this.unavailableTimer.ensureAborted();
              }
              sendActivityCheck() {
                this.stopActivityCheck(), this.connection.ping(), this.activityTimer = new fe(this.options.pongTimeout, () => {
                  this.timeline.error({ pong_timed_out: this.options.pongTimeout }), this.retryIn(0);
                });
              }
              resetActivityCheck() {
                this.stopActivityCheck(), this.connection && !this.connection.handlesActivityChecks() && (this.activityTimer = new fe(this.activityTimeout, () => {
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
                  var a = e;
                  a === "connected" && (a += " with new socket ID " + r.socket_id), U.debug("State changed", o + " -> " + a), this.timeline.info({ state: e, params: r }), this.emit("state_change", { previous: o, current: e }), this.emit(e, r);
                }
              }
              shouldRetry() {
                return this.state === "connecting" || this.state === "connected";
              }
            }
            class di {
              constructor() {
                this.channels = {};
              }
              add(e, r) {
                return this.channels[e] || (this.channels[e] = fi(e, r)), this.channels[e];
              }
              all() {
                return Tr(this.channels);
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
            function fi(i, e) {
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
            var pi = {
              createChannels() {
                return new di();
              },
              createConnectionManager(i, e) {
                return new hi(i, e);
              },
              createChannel(i, e) {
                return new ht(i, e);
              },
              createPrivateChannel(i, e) {
                return new dt(i, e);
              },
              createPresenceChannel(i, e) {
                return new ci(i, e);
              },
              createEncryptedChannel(i, e, r) {
                return new li(i, e, r);
              },
              createTimelineSender(i, e) {
                return new si(i, e);
              },
              createHandshake(i, e) {
                return new ii(i, e);
              },
              createAssistantToTheTransportManager(i, e, r) {
                return new ni(i, e, r);
              }
            }, oe = pi;
            class Zt {
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
            class _e {
              constructor(e, r) {
                this.strategies = e, this.loop = !!r.loop, this.failFast = !!r.failFast, this.timeout = r.timeout, this.timeoutLimit = r.timeoutLimit;
              }
              isSupported() {
                return Jt(this.strategies, X.method("isSupported"));
              }
              connect(e, r) {
                var o = this.strategies, a = 0, p = this.timeout, w = null, P = (O, I) => {
                  I ? r(null, I) : (a = a + 1, this.loop && (a = a % o.length), a < o.length ? (p && (p = p * 2, this.timeoutLimit && (p = Math.min(p, this.timeoutLimit))), w = this.tryStrategy(o[a], e, { timeout: p, failFast: this.failFast }, P)) : r(!0));
                };
                return w = this.tryStrategy(o[a], e, { timeout: p, failFast: this.failFast }, P), {
                  abort: function() {
                    w.abort();
                  },
                  forceMinPriority: function(O) {
                    e = O, w && w.forceMinPriority(O);
                  }
                };
              }
              tryStrategy(e, r, o, a) {
                var p = null, w = null;
                return o.timeout > 0 && (p = new fe(o.timeout, function() {
                  w.abort(), a(!0);
                })), w = e.connect(r, function(P, O) {
                  P && p && p.isRunning() && !o.failFast || (p && p.ensureAborted(), a(P, O));
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
            class pt {
              constructor(e) {
                this.strategies = e;
              }
              isSupported() {
                return Jt(this.strategies, X.method("isSupported"));
              }
              connect(e, r) {
                return _i(this.strategies, e, function(o, a) {
                  return function(p, w) {
                    if (a[o].error = p, p) {
                      vi(a) && r(!0);
                      return;
                    }
                    Pe(a, function(P) {
                      P.forceMinPriority(w.transport.priority);
                    }), r(null, w);
                  };
                });
              }
            }
            function _i(i, e, r) {
              var o = Bt(i, function(a, p, w, P) {
                return a.connect(e, r(p, P));
              });
              return {
                abort: function() {
                  Pe(o, gi);
                },
                forceMinPriority: function(a) {
                  Pe(o, function(p) {
                    p.forceMinPriority(a);
                  });
                }
              };
            }
            function vi(i) {
              return Ar(i, function(e) {
                return !!e.error;
              });
            }
            function gi(i) {
              !i.error && !i.aborted && (i.abort(), i.aborted = !0);
            }
            class mi {
              constructor(e, r, o) {
                this.strategy = e, this.transports = r, this.ttl = o.ttl || 1800 * 1e3, this.usingTLS = o.useTLS, this.timeline = o.timeline;
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.usingTLS, a = bi(o), p = a && a.cacheSkipCount ? a.cacheSkipCount : 0, w = [this.strategy];
                if (a && a.timestamp + this.ttl >= X.now()) {
                  var P = this.transports[a.transport];
                  P && (["ws", "wss"].includes(a.transport) || p > 3 ? (this.timeline.info({
                    cached: !0,
                    transport: a.transport,
                    latency: a.latency
                  }), w.push(new _e([P], {
                    timeout: a.latency * 2 + 1e3,
                    failFast: !0
                  }))) : p++);
                }
                var O = X.now(), I = w.pop().connect(e, function N(j, Fe) {
                  j ? (en(o), w.length > 0 ? (O = X.now(), I = w.pop().connect(e, N)) : r(j)) : (yi(o, Fe.transport.name, X.now() - O, p), r(null, Fe));
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
            function _t(i) {
              return "pusherTransport" + (i ? "TLS" : "NonTLS");
            }
            function bi(i) {
              var e = A.getLocalStorage();
              if (e)
                try {
                  var r = e[_t(i)];
                  if (r)
                    return JSON.parse(r);
                } catch {
                  en(i);
                }
              return null;
            }
            function yi(i, e, r, o) {
              var a = A.getLocalStorage();
              if (a)
                try {
                  a[_t(i)] = je({
                    timestamp: X.now(),
                    transport: e,
                    latency: r,
                    cacheSkipCount: o
                  });
                } catch {
                }
            }
            function en(i) {
              var e = A.getLocalStorage();
              if (e)
                try {
                  delete e[_t(i)];
                } catch {
                }
            }
            class qe {
              constructor(e, { delay: r }) {
                this.strategy = e, this.options = { delay: r };
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.strategy, a, p = new fe(this.options.delay, function() {
                  a = o.connect(e, r);
                });
                return {
                  abort: function() {
                    p.ensureAborted(), a && a.abort();
                  },
                  forceMinPriority: function(w) {
                    e = w, a && a.forceMinPriority(w);
                  }
                };
              }
            }
            class Oe {
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
            class wi {
              constructor(e) {
                this.strategy = e;
              }
              isSupported() {
                return this.strategy.isSupported();
              }
              connect(e, r) {
                var o = this.strategy.connect(e, function(a, p) {
                  p && o.abort(), r(a, p);
                });
                return o;
              }
            }
            function Ae(i) {
              return function() {
                return i.isSupported();
              };
            }
            var Si = function(i, e, r) {
              var o = {};
              function a(dn, ws, Ss, xs, ks) {
                var fn = r(i, dn, ws, Ss, xs, ks);
                return o[dn] = fn, fn;
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
              }), O = {
                loop: !0,
                timeout: 15e3,
                timeoutLimit: 6e4
              }, I = new Zt({
                minPingDelay: 1e4,
                maxPingDelay: i.activityTimeout
              }), N = new Zt({
                lives: 2,
                minPingDelay: 1e4,
                maxPingDelay: i.activityTimeout
              }), j = a("ws", "ws", 3, p, I), Fe = a("wss", "ws", 3, w, I), vs = a("sockjs", "sockjs", 1, P), on = a("xhr_streaming", "xhr_streaming", 1, P, N), gs = a("xdr_streaming", "xdr_streaming", 1, P, N), an = a("xhr_polling", "xhr_polling", 1, P), ms = a("xdr_polling", "xdr_polling", 1, P), cn = new _e([j], O), bs = new _e([Fe], O), ys = new _e([vs], O), un = new _e([
                new Oe(Ae(on), on, gs)
              ], O), ln = new _e([
                new Oe(Ae(an), an, ms)
              ], O), hn = new _e([
                new Oe(Ae(un), new pt([
                  un,
                  new qe(ln, { delay: 4e3 })
                ]), ln)
              ], O), bt = new Oe(Ae(hn), hn, ys), yt;
              return e.useTLS ? yt = new pt([
                cn,
                new qe(bt, { delay: 2e3 })
              ]) : yt = new pt([
                cn,
                new qe(bs, { delay: 2e3 }),
                new qe(bt, { delay: 5e3 })
              ]), new mi(new wi(new Oe(Ae(j), yt, bt)), o, {
                ttl: 18e5,
                timeline: e.timeline,
                useTLS: e.useTLS
              });
            }, xi = Si, ki = (function() {
              var i = this;
              i.timeline.info(i.buildTimelineMessage({
                transport: i.name + (i.options.useTLS ? "s" : "")
              })), i.hooks.isInitialized() ? i.changeState("initialized") : i.hooks.file ? (i.changeState("initializing"), d.load(i.hooks.file, { useTLS: i.options.useTLS }, function(e, r) {
                i.hooks.isInitialized() ? (i.changeState("initialized"), r(!0)) : (e && i.onError(e), i.onClose(), r(!1));
              })) : i.onClose();
            }), Ci = {
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
            }, Ti = Ci;
            const Pi = 256 * 1024;
            class Oi extends se {
              constructor(e, r, o) {
                super(), this.hooks = e, this.method = r, this.url = o;
              }
              start(e) {
                this.position = 0, this.xhr = this.hooks.getRequest(this), this.unloader = () => {
                  this.close();
                }, A.addUnloadListener(this.unloader), this.xhr.open(this.method, this.url, !0), this.xhr.setRequestHeader && this.xhr.setRequestHeader("Content-Type", "application/json"), this.xhr.send(e);
              }
              close() {
                this.unloader && (A.removeUnloadListener(this.unloader), this.unloader = null), this.xhr && (this.hooks.abortRequest(this.xhr), this.xhr = null);
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
                return this.position === e.length && e.length > Pi;
              }
            }
            var vt;
            (function(i) {
              i[i.CONNECTING = 0] = "CONNECTING", i[i.OPEN = 1] = "OPEN", i[i.CLOSED = 3] = "CLOSED";
            })(vt || (vt = {}));
            var ve = vt, Ai = 1;
            class Ei {
              constructor(e, r) {
                this.hooks = e, this.session = nn(1e3) + "/" + Ni(8), this.location = Ii(r), this.readyState = ve.CONNECTING, this.openStream();
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
                if (this.readyState === ve.OPEN)
                  try {
                    return A.createSocketRequest("POST", tn(Li(this.location, this.session))).start(e), !0;
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
                this.closeStream(), this.readyState = ve.CLOSED, this.onclose && this.onclose({
                  code: e,
                  reason: r,
                  wasClean: o
                });
              }
              onChunk(e) {
                if (e.status === 200) {
                  this.readyState === ve.OPEN && this.onActivity();
                  var r, o = e.data.slice(0, 1);
                  switch (o) {
                    case "o":
                      r = JSON.parse(e.data.slice(1) || "{}"), this.onOpen(r);
                      break;
                    case "a":
                      r = JSON.parse(e.data.slice(1) || "[]");
                      for (var a = 0; a < r.length; a++)
                        this.onEvent(r[a]);
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
                this.readyState === ve.CONNECTING ? (e && e.hostname && (this.location.base = Ri(this.location.base, e.hostname)), this.readyState = ve.OPEN, this.onopen && this.onopen()) : this.onClose(1006, "Server lost session", !0);
              }
              onEvent(e) {
                this.readyState === ve.OPEN && this.onmessage && this.onmessage({ data: e });
              }
              onActivity() {
                this.onactivity && this.onactivity();
              }
              onError(e) {
                this.onerror && this.onerror(e);
              }
              openStream() {
                this.stream = A.createSocketRequest("POST", tn(this.hooks.getReceiveURL(this.location, this.session))), this.stream.bind("chunk", (e) => {
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
            function Ii(i) {
              var e = /([^\?]*)\/*(\??.*)/.exec(i);
              return {
                base: e[1],
                queryString: e[2]
              };
            }
            function Li(i, e) {
              return i.base + "/" + e + "/xhr_send";
            }
            function tn(i) {
              var e = i.indexOf("?") === -1 ? "?" : "&";
              return i + e + "t=" + +/* @__PURE__ */ new Date() + "&n=" + Ai++;
            }
            function Ri(i, e) {
              var r = /(https?:\/\/)([^\/:]+)((\/|:)?.*)/.exec(i);
              return r[1] + e + r[3];
            }
            function nn(i) {
              return A.randomInt(i);
            }
            function Ni(i) {
              for (var e = [], r = 0; r < i; r++)
                e.push(nn(32).toString(32));
              return e.join("");
            }
            var $i = Ei, Ui = {
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
            }, Di = Ui, Hi = {
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
            }, Mi = Hi, ji = {
              getRequest: function(i) {
                var e = A.getXHRAPI(), r = new e();
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
            }, zi = ji, qi = {
              createStreamingSocket(i) {
                return this.createSocket(Di, i);
              },
              createPollingSocket(i) {
                return this.createSocket(Mi, i);
              },
              createSocket(i, e) {
                return new $i(i, e);
              },
              createXHR(i, e) {
                return this.createRequest(zi, i, e);
              },
              createRequest(i, e, r) {
                return new Oi(i, e, r);
              }
            }, rn = qi;
            rn.createXDR = function(i, e) {
              return this.createRequest(Ti, i, e);
            };
            var Bi = rn, Fi = {
              nextAuthCallbackID: 1,
              auth_callbacks: {},
              ScriptReceivers: h,
              DependenciesReceivers: y,
              getDefaultStrategy: xi,
              Transports: Zr,
              transportConnectionInitializer: ki,
              HTTPFactory: Bi,
              TimelineTransport: jr,
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
                return { ajax: V, jsonp: $r };
              },
              onDocumentBody(i) {
                document.body ? i() : setTimeout(() => {
                  this.onDocumentBody(i);
                }, 0);
              },
              createJSONPRequest(i, e) {
                return new Dr(i, e);
              },
              createScriptRequest(i) {
                return new Ur(i);
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
                return ti;
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
            }, A = Fi, gt;
            (function(i) {
              i[i.ERROR = 3] = "ERROR", i[i.INFO = 6] = "INFO", i[i.DEBUG = 7] = "DEBUG";
            })(gt || (gt = {}));
            var Be = gt;
            class Wi {
              constructor(e, r, o) {
                this.key = e, this.session = r, this.events = [], this.options = o || {}, this.sent = 0, this.uniqueID = 0;
              }
              log(e, r) {
                e <= this.options.level && (this.events.push(Q({}, r, { timestamp: X.now() })), this.options.limit && this.events.length > this.options.limit && this.events.shift());
              }
              error(e) {
                this.log(Be.ERROR, e);
              }
              info(e) {
                this.log(Be.INFO, e);
              }
              debug(e) {
                this.log(Be.DEBUG, e);
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
                return this.events = [], e(o, (a, p) => {
                  a || this.sent++, r && r(a, p);
                }), !0;
              }
              generateUniqueID() {
                return this.uniqueID++, this.uniqueID;
              }
            }
            class Ji {
              constructor(e, r, o, a) {
                this.name = e, this.priority = r, this.transport = o, this.options = a || {};
              }
              isSupported() {
                return this.transport.isSupported({
                  useTLS: this.options.useTLS
                });
              }
              connect(e, r) {
                if (this.isSupported()) {
                  if (this.priority < e)
                    return sn(new E(), r);
                } else return sn(new Y(), r);
                var o = !1, a = this.transport.createConnection(this.name, this.priority, this.options.key, this.options), p = null, w = function() {
                  a.unbind("initialized", w), a.connect();
                }, P = function() {
                  p = oe.createHandshake(a, function(j) {
                    o = !0, N(), r(null, j);
                  });
                }, O = function(j) {
                  N(), r(j);
                }, I = function() {
                  N();
                  var j;
                  j = je(a), r(new $(j));
                }, N = function() {
                  a.unbind("initialized", w), a.unbind("open", P), a.unbind("error", O), a.unbind("closed", I);
                };
                return a.bind("initialized", w), a.bind("open", P), a.bind("error", O), a.bind("closed", I), a.initialize(), {
                  abort: () => {
                    o || (N(), p ? p.close() : a.close());
                  },
                  forceMinPriority: (j) => {
                    o || this.priority < j && (p ? p.close() : a.close());
                  }
                };
              }
            }
            function sn(i, e) {
              return X.defer(function() {
                e(i);
              }), {
                abort: function() {
                },
                forceMinPriority: function() {
                }
              };
            }
            const { Transports: Xi } = A;
            var Gi = function(i, e, r, o, a, p) {
              var w = Xi[r];
              if (!w)
                throw new K(r);
              var P = (!i.enabledTransports || zt(i.enabledTransports, e) !== -1) && (!i.disabledTransports || zt(i.disabledTransports, e) === -1), O;
              return P ? (a = Object.assign({ ignoreNullOrigin: i.ignoreNullOrigin }, a), O = new Ji(e, o, p ? p.getAssistant(w) : w, a)) : O = Vi, O;
            }, Vi = {
              isSupported: function() {
                return !1;
              },
              connect: function(i, e) {
                var r = X.defer(function() {
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
            function Ki(i) {
              if (i == null)
                throw "You must pass an options object";
              if (i.cluster == null)
                throw "Options object must provide a cluster";
              "disableStats" in i && U.warn("The disableStats option is deprecated in favor of enableStats");
            }
            const Yi = (i, e) => {
              var r = "socket_id=" + encodeURIComponent(i.socketId);
              for (var o in e.params)
                r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(e.params[o]);
              if (e.paramsProvider != null) {
                let a = e.paramsProvider();
                for (var o in a)
                  r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(a[o]);
              }
              return r;
            };
            var Qi = (i) => {
              if (typeof A.getAuthorizers()[i.transport] > "u")
                throw `'${i.transport}' is not a recognized auth transport`;
              return (e, r) => {
                const o = Yi(e, i);
                A.getAuthorizers()[i.transport](A, o, i, C.UserAuthentication, r);
              };
            };
            const Zi = (i, e) => {
              var r = "socket_id=" + encodeURIComponent(i.socketId);
              r += "&channel_name=" + encodeURIComponent(i.channelName);
              for (var o in e.params)
                r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(e.params[o]);
              if (e.paramsProvider != null) {
                let a = e.paramsProvider();
                for (var o in a)
                  r += "&" + encodeURIComponent(o) + "=" + encodeURIComponent(a[o]);
              }
              return r;
            };
            var es = (i) => {
              if (typeof A.getAuthorizers()[i.transport] > "u")
                throw `'${i.transport}' is not a recognized auth transport`;
              return (e, r) => {
                const o = Zi(e, i);
                A.getAuthorizers()[i.transport](A, o, i, C.ChannelAuthorization, r);
              };
            };
            const ts = (i, e, r) => {
              const o = {
                authTransport: e.transport,
                authEndpoint: e.endpoint,
                auth: {
                  params: e.params,
                  headers: e.headers
                }
              };
              return (a, p) => {
                const w = i.channel(a.channelName);
                r(w, o).authorize(a.socketId, p);
              };
            };
            function ns(i, e) {
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
                enableStats: as(i),
                httpHost: rs(i),
                useTLS: os(i),
                wsHost: is(i),
                userAuthenticator: cs(i),
                channelAuthorizer: ls(i, e)
              };
              return "disabledTransports" in i && (r.disabledTransports = i.disabledTransports), "enabledTransports" in i && (r.enabledTransports = i.enabledTransports), "ignoreNullOrigin" in i && (r.ignoreNullOrigin = i.ignoreNullOrigin), "timelineParams" in i && (r.timelineParams = i.timelineParams), "nacl" in i && (r.nacl = i.nacl), r;
            }
            function rs(i) {
              return i.httpHost ? i.httpHost : i.cluster ? `sockjs-${i.cluster}.pusher.com` : _.httpHost;
            }
            function is(i) {
              return i.wsHost ? i.wsHost : ss(i.cluster);
            }
            function ss(i) {
              return `ws-${i}.pusher.com`;
            }
            function os(i) {
              return A.getProtocol() === "https:" ? !0 : i.forceTLS !== !1;
            }
            function as(i) {
              return "enableStats" in i ? i.enableStats : "disableStats" in i ? !i.disableStats : !1;
            }
            function cs(i) {
              const e = Object.assign(Object.assign({}, _.userAuthentication), i.userAuthentication);
              return "customHandler" in e && e.customHandler != null ? e.customHandler : Qi(e);
            }
            function us(i, e) {
              let r;
              return "channelAuthorization" in i ? r = Object.assign(Object.assign({}, _.channelAuthorization), i.channelAuthorization) : (r = {
                transport: i.authTransport || _.authTransport,
                endpoint: i.authEndpoint || _.authEndpoint
              }, "auth" in i && ("params" in i.auth && (r.params = i.auth.params), "headers" in i.auth && (r.headers = i.auth.headers)), "authorizer" in i && (r.customHandler = ts(e, r, i.authorizer))), r;
            }
            function ls(i, e) {
              const r = us(i, e);
              return "customHandler" in r && r.customHandler != null ? r.customHandler : es(r);
            }
            class hs extends se {
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
            function ds() {
              let i, e;
              return { promise: new Promise((o, a) => {
                i = o, e = a;
              }), resolve: i, reject: e };
            }
            var fs = ds;
            class ps extends se {
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
                }), this.watchlist = new hs(e), this.pusher.connection.bind("message", (r) => {
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
                this.serverToUserChannel = new ht(`#server-to-user-${this.user_data.id}`, this.pusher), this.serverToUserChannel.bind_global((r, o) => {
                  r.indexOf("pusher_internal:") === 0 || r.indexOf("pusher:") === 0 || this.emit(r, o);
                }), e(this.serverToUserChannel);
              }
              _cleanup() {
                this.user_data = null, this.serverToUserChannel && (this.serverToUserChannel.unbind_all(), this.serverToUserChannel.disconnect(), this.serverToUserChannel = null), this.signin_requested && this._signinDoneResolve();
              }
              _newSigninPromiseIfNeeded() {
                if (!this.signin_requested || this.signinDonePromise && !this.signinDonePromise.done)
                  return;
                const { promise: e, resolve: r } = fs();
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
                return qt(Wt({ ws: A.Transports.ws }, function(e) {
                  return e.isSupported({});
                }));
              }
              constructor(e, r) {
                _s(e), Ki(r), this.key = e, this.config = ns(r, this), this.channels = oe.createChannels(), this.global_emitter = new se(), this.sessionID = A.randomInt(1e9), this.timeline = new Wi(this.key, this.sessionID, {
                  cluster: this.config.cluster,
                  features: B.getClientFeatures(),
                  params: this.config.timelineParams || {},
                  limit: 50,
                  level: Be.INFO,
                  version: _.VERSION
                }), this.config.enableStats && (this.timelineSender = oe.createTimelineSender(this.timeline, {
                  host: this.config.statsHost,
                  path: "/timeline/v2/" + A.TimelineTransport.name
                }));
                var o = (a) => A.getDefaultStrategy(this.config, a, Gi);
                this.connection = oe.createConnectionManager(this.key, {
                  getStrategy: o,
                  timeline: this.timeline,
                  activityTimeout: this.config.activityTimeout,
                  pongTimeout: this.config.pongTimeout,
                  unavailableTimeout: this.config.unavailableTimeout,
                  useTLS: !!this.config.useTLS
                }), this.connection.bind("connected", () => {
                  this.subscribeAll(), this.timelineSender && this.timelineSender.send(this.connection.isUsingTLS());
                }), this.connection.bind("message", (a) => {
                  var p = a.event, w = p.indexOf("pusher_internal:") === 0;
                  if (a.channel) {
                    var P = this.channel(a.channel);
                    P && P.handleEvent(a);
                  }
                  w || this.global_emitter.emit(a.event, a.data);
                }), this.connection.bind("connecting", () => {
                  this.channels.disconnect();
                }), this.connection.bind("disconnected", () => {
                  this.channels.disconnect();
                }), this.connection.bind("error", (a) => {
                  U.warn(a);
                }), B.instances.push(this), this.timeline.info({ instances: B.instances.length }), this.user = new ps(this), B.isReady && this.connect();
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
                  this.timelineSenderTimer = new xr(6e4, function() {
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
            B.instances = [], B.isReady = !1, B.logToConsole = !1, B.Runtime = A, B.ScriptReceivers = A.ScriptReceivers, B.DependenciesReceivers = A.DependenciesReceivers, B.auth_callbacks = A.auth_callbacks;
            var mt = c.default = B;
            function _s(i) {
              if (i == null)
                throw "You must pass your app key when you instantiate Pusher.";
            }
            A.setup(B);
          })
          /******/
        ])
      );
    });
  })(kt)), kt.exports;
}
var pr = jo();
const zo = /* @__PURE__ */ Mo(pr), qo = /* @__PURE__ */ Cs({
  __proto__: null,
  default: zo
}, [pr]);
export {
  Ho as default
};
