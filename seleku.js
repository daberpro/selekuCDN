
  // core.js
  var Core = class {
    constructor() {
    }
    init() {
    }
    create() {
    }
    destroy() {
    }
    remove() {
    }
  };

  // utility.js
  function checkBinding(text_node) {
    let allBindingValue = text_node?.match(/\{{.*?\}}/igm);
    allBindingValue = [...new Set(allBindingValue)];
    let value = {};
    if (allBindingValue instanceof Array && allBindingValue.length !== 0) {
      for (let x2 of allBindingValue) {
        value = {
          ...value,
          [x2.replace(/\{{/igm, "").replace(/\}}/igm, "")]: x2
        };
      }
      return {
        binding: true,
        value
      };
    }
    return {
      binding: false,
      value
    };
  }
  function createElement(name, inner) {
    !inner.hasOwnProperty("inner") && inner instanceof Object ? inner["inner"] = "" : 0;
    let element = document.createElement(name);
    let _inner = document.createTextNode(inner);
    let copyValue = inner["inner"];
    if (!(inner instanceof Object)) {
      element.appendChild(_inner);
    } else {
      if (inner.hasOwnProperty("inherit:props") && inner["inherit:props"] instanceof Object) {
        inner["props"] = {
          ...inner["props"],
          ...inner["inherit:props"]
        };
      }
      inner["inner"] = inner["inner"]?.replace(/(\n|\t)/igm, " ");
      let bind = checkBinding(inner["inner"]);
      for (let x2 in inner["props"]) {
        if (bind.binding && x2 in bind.value) {
          copyValue = copyValue.replaceAll(bind.value[x2], inner["props"][x2]);
        }
      }
      let evaluation = "";
      for (let y in inner["props"]) {
        try {
          if (inner["props"][y] instanceof Object && typeof inner["props"][y] !== "function")
            evaluation += `let ${y} = ${JSON.stringify(inner["props"][y])};`;
          if (typeof inner["props"][y] === "number")
            evaluation += `let ${y} = ${inner["props"][y]};`;
          if (typeof inner["props"][y] === "string")
            evaluation += `let ${y} = "${inner["props"][y]}";`;
          if (typeof inner["props"][y] === "function")
            evaluation += `let ${y} = ${inner["props"][y]};`.replace(/(\n|\t)/igm, " ");
        } catch (err) {
          console.warn(err.message);
        }
      }
      for (let x in bind.value) {
        if (!(x in inner["props"])) {
          try {
            copyValue = copyValue.replaceAll(bind.value[x], eval(`${evaluation} ${x}`));
          } catch (err) {
            console.warn(err.message);
          }
        }
      }
      _inner = document.createTextNode(copyValue);
      element.appendChild(_inner);
      if (inner.hasOwnProperty("event") && inner["event"] instanceof Object) {
        for (let x2 in inner["event"]) {
          element[x2] = inner["event"][x2];
        }
      }
      if (inner.hasOwnProperty("attribute"))
        for (let x2 in inner["attribute"]) {
          let bind2 = checkBinding(inner["attribute"][x2]);
          if (bind2.binding) {
            for (let y in bind2.value)
              if (inner["props"].hasOwnProperty(y)) {
                element.setAttribute(x2, inner["attribute"][x2].replaceAll(bind2.value[y], inner["props"][y]));
              } else {
                console.warn(y + " props not found!!");
                element.setAttribute(x2, void 0);
              }
          } else {
            element.setAttribute(x2, inner["attribute"][x2]);
          }
        }
    }
    let children = inner["children"] || [];
    let content = typeof inner === "string" ? inner : inner["inner"];
    return {
      name,
      _inner,
      element,
      content,
      event: inner["event"] || {},
      children,
      "inherit:props": inner["inherit:props"] || {},
      attribute: inner["attribute"] || {},
      "@id": (() => {
        try {
          return eval(inner["@id"]) || null;
        } catch (err) {
          return inner["@id"];
        }
      })(),
      type: "ChildComponent",
      props: inner["props"] || {},
      update(callback = () => {
      }) {
        if (inner.hasOwnProperty("inherit:props") && inner["inherit:props"] instanceof Object) {
          inner["props"] = {
            ...inner["props"],
            ...inner["inherit:props"]
          };
        }
        let _inner = document.createTextNode(inner);
        if (inner.hasOwnProperty("attribute"))
          for (let x2 in inner["attribute"]) {
            let bind2 = checkBinding(inner["attribute"][x2]);
            if (bind2.binding) {
              for (let y in bind2.value)
                if (inner["props"].hasOwnProperty(y)) {
                  element.setAttribute(x2, inner["attribute"][x2].replaceAll(bind2.value[y], inner["props"][y]));
                } else {
                  console.warn(y + " props not found!!");
                  element.setAttribute(x2, void 0);
                }
            } else {
              element.setAttribute(x2, inner["attribute"][x2]);
            }
          }
        if (this.hasOwnProperty("event") && this["event"] instanceof Object) {
          for (let x2 in this["event"]) {
            this.element[x2] = this["event"][x2];
          }
        }
        if (inner instanceof Object) {
          inner["inner"] = inner["inner"].replace(/(\n|\t)/igm, " ");
          let bind = checkBinding(inner["inner"]);
          let copyValue = inner["inner"];
          for (let x2 in this.props) {
            if (bind.binding && x2 in bind.value) {
              copyValue = copyValue.replaceAll(bind.value[x2], this.props[x2]);
            }
          }
          let evaluation = "";
          for (let y in this.props) {
            try {
              if (this.props[y] instanceof Object && typeof this.props[y] !== "function")
                evaluation += `let ${y} = ${JSON.stringify(this.props[y])};`;
              if (typeof this.props[y] === "number")
                evaluation += `let ${y} = ${this.props[y]};`;
              if (typeof this.props[y] === "string")
                evaluation += `let ${y} = "${this.props[y]}";`;
              if (typeof this.props[y] === "function")
                evaluation += `let ${y} = ${this.props[y]};`.replace(/(\n|\t)/igm, " ");
            } catch (err) {
              console.warn(err.message);
            }
          }
          for (let x in bind.value) {
            if (!(x in this.props)) {
              try {
                copyValue = copyValue.replaceAll(bind.value[x], eval(`${evaluation} ${x}`));
              } catch (err) {
                console.warn(err.message);
              }
            }
          }
          this._inner.replaceData(0, this._inner.length, copyValue);
        }
        return callback(this);
      }
    };
  }
  function rootElement(child2, parent) {
    parent.appendChild(child2.element);
    if (child2.children.length > 0) {
      for (let x2 of child2.children)
        rootElement(x2, child2.element);
    }
  }
  function toString(b) {
    let c = Object.keys(b).map((e) => {
      if (b[e] instanceof Array) {
        return `${e}:[${b[e].map((x2) => {
          if (typeof x2 === "string")
            return `"${x2}"`;
          else
            return x2;
        })}]`;
      }
      if (b[e] instanceof Object && typeof b[e] !== "function") {
        return `${e}:${toString(b[e])}`;
      }
      return typeof b[e] === "number" ? `${e}:${b[e]}` : `${e}:"${b[e]}"`;
    });
    let g = "{";
    for (let x2 in c) {
      if (parseInt(x2) === c.length - 1) {
        g += c[x2] + "}";
      } else {
        g += c[x2] + ",";
      }
    }
    if (g === "{")
      return "{}";
    return g;
  }
  function toRawComponent(component, propsForAll = {}) {
    let children2 = [];
    if (component.children.length > 0) {
      for (let x2 of component.children) {
        children2.push(toRawComponent(x2, propsForAll));
      }
    }
    let template = ``;
    if (!component.hasOwnProperty("attribute"))
      component["attribute"] = {};
    if (component.type === "ChildComponent") {
      template = `

			createElement("${component.name}",{
				"@id": "${component["@id"] || null}",
				inner: "${component.content}",
				children: [${children2}],
				attribute: ${toString(component["attribute"])},
				"inherit:props": ${toString(component["inherit:props"] || {})},
				props: ${toString({ ...component.props, ...propsForAll })}
			})

		`;
    }
    if (component.type === "conditionComponent") {
      template = `

			conditionalComponent("${component.name}",{
				"@id": "${component["@id"] || null}",
				inner: "${component.content}",
				children: [${children2}],
				attribute: ${toString(component["attribute"])},
				props: ${toString({ ...component.props, ...propsForAll })},
				"inherit:props": ${toString(component["inherit:props"] || {})},
				condition: "${component.condition}"
			})

		`;
    }
    if (component.type === "LoopComponent") {
      template = `

			loopComponent("${component.name}",{
				"@id": "${component["@id"] || null}",
				inner: "${component.content}",
				child: ${toRawComponent(component.child)},
				attribute: ${toString(component["attribute"])},
				props: ${toString({ ...component.props, ...propsForAll })},
				"inherit:props": ${toString(component["inherit:props"] || {})},
				loop: "${component.loop}"
			})

		`;
    }
    return template;
  }
  function importComponent(child, props) {
    if (props !== void 0 && props !== null)
      child.props = props;
    if (child.props.hasOwnProperty("@id")) {
      child["@id"] = child.props["@id"];
      delete child.props["@id"];
    }
    if (child.props.hasOwnProperty("inherit:props")) {
      child["inherit:props"] = child.props["inherit:props"];
      delete child.props["inherit:props"];
    }
    try {
      return eval(toRawComponent(child, props));
    } catch (err) {
      console.warn(err.message);
    }
  }
  function loopComponent(name, inner) {
    const parentElement = createElement(name, inner);
    let token = inner["loop"].split(" ");
    if (token[2] in inner["props"]) {
      if (!(inner["props"][token[2]] instanceof Array)) {
        inner["props"][token[2]] = [];
      }
      try {
        let allChildren = [];
        for (let x2 of inner["child"]["children"]) {
          allChildren.push(toRawComponent(x2));
        }
        if (inner["child"].type !== "conditionComponent")
          eval(`for(let ${token[0]} ${token[1]} inner["props"]["${token[2]}"]){

				parentElement["children"].push(createElement(inner["child"].name,{
					inner: inner["child"].content,
					props: {
						...inner["props"],
						${token[0]}
					},
					attribute: ${toString(inner["child"].attribute)},
					"@id": inner["child"]["@id"],
					event: inner["child"]["event"],
					"inherit:props": inner["child"]["inherit:props"] || {},
					children: [${allChildren.join()}]
				}));

			}`);
        else
          eval(`for(let ${token[0]} ${token[1]} inner["props"]["${token[2]}"]){

				parentElement["children"].push(conditionalComponent(inner["child"].name,{
					inner: inner["child"].content,
					props: {
						...inner["props"],
						${token[0]}
					},
					attribute: ${toString(inner["child"].attribute)},
					"@id": inner["child"]["@id"],
					event: inner["child"]["event"],
					"inherit:props": inner["child"]["inherit:props"] || {},
					children: [${allChildren.join()}]
				}));

			}`);
      } catch (err) {
        console.warn(err.message);
      }
    }
    return {
      ...parentElement,
      child: inner["child"],
      loop: inner["loop"],
      props: parentElement["props"],
      type: "LoopComponent",
      update(callback = () => {
      }) {
        parentElement.update();
        let allElement = [];
        for (let x2 of this.children) {
          x2.element.remove();
        }
        this.children = [];
        if (token[2] in this.props) {
          try {
            let allChildren = [];
            let props = this.child["props"];
            let condition = this.child.condition;
            for (let x2 of this.child["children"]) {
              allChildren.push(toRawComponent(x2));
            }
            if (inner["child"].type !== "conditionComponent") {
              eval(`for(let ${token[0]} ${token[1]} this["props"]["${token[2]}"]){

								this.children.push(createElement(inner["child"].name,{
									inner: inner["child"].content,
									props: {
										...${toString(props)},
										${token[0]}
									},
									attribute: ${toString(inner["child"].attribute)},
									"@id": inner["child"]["@id"],
									event: inner["child"]["event"],
									"inherit:props": inner["child"]["inherit:props"] || {},
									children: [${allChildren.join()}]
								}));

							}`);
            } else {
              eval(`for(let ${token[0]} ${token[1]} this["props"]["${token[2]}"]){

								this.children.push(conditionalComponent(inner["child"].name,{
									inner: inner["child"].content,
									props: {
										...${toString(props)},
										${token[0]}
									},
									attribute: ${toString(inner["child"].attribute)},
									"@id": inner["child"]["@id"],
									condition: "${condition}",
									event: inner["child"]["event"],
									"inherit:props": inner["child"]["inherit:props"] || {},
									children: [${allChildren.join()}]
								}));

							}`);
            }
          } catch (err) {
            console.warn(err.message);
          }
        }
        for (let x2 of this.children) {
          rootElement(x2, parentElement.element);
        }
        return callback(this);
      }
    };
  }
  function desrtoyChild(child2) {
    child2.element.remove();
    if (child2.children.length > 0) {
      for (let x2 of child2.children)
        desrtoyChild(x2);
    }
  }
  function conditionalComponent(name, inner) {
    const parentElement = createElement(name, inner);
    if (inner["props"][inner["condition"]] !== null && eval(inner["props"][inner["condition"]])) {
      for (let x2 of parentElement.children) {
        rootElement(x2, parentElement.element);
      }
    } else {
      for (let x2 of parentElement.children) {
        desrtoyChild(x2);
      }
    }
    return {
      ...parentElement,
      type: "conditionComponent",
      condition: inner["condition"],
      update(callback2 = () => {
      }) {
        parentElement.update();
        if (this.props[this.condition]) {
          for (let x2 of parentElement.children) {
            rootElement(x2, parentElement.element);
          }
        } else {
          for (let x2 of parentElement.children) {
            desrtoyChild(x2);
          }
        }
        return callback2(this);
      }
    };
  }

  // reactivity.js
  var Reactivity = class {
    constructor(object, fragment = {}) {
      this.object = object;
      this.fragment = fragment;
    }
    create({ eventSetter, eventGetter }) {
      const fragment = this.fragment;
      const obj = this.object;
      return new Proxy(this.object, {
        set(args1, args2, args3, args4, obj2) {
          eventSetter([args1, args2, args3, args4, fragment]);
          return true;
        },
        get(args1, args2, args3, args4) {
          return eventGetter([args1, args2, args3, args4, fragment]);
        }
      });
    }
  };

  // component.js
  function setProps(child2, props2, value, parents) {
    if (child2.props[props2] !== void 0)
      child2.props[props2] = value;
    if (child2.hasOwnProperty("inherit:props") && child2["inherit:props"] !== null && Object.keys(child2["inherit:props"]).length > 0) {
      let obj = {};
      Object.keys(child2["inherit:props"]).filter((a) => parents?.props?.hasOwnProperty(a)).map((a) => obj = { ...obj, [a]: parents?.props?.[a] });
      child2["inherit:props"] = {
        ...child2["inherit:props"],
        ...obj
      };
      child2["props"] = {
        ...child2["props"],
        ...obj
      };
    }
    if (child2.hasOwnProperty("child") && child2.child.children.length === 0 && child2.child.hasOwnProperty("inherit:props") && child2.child["inherit:props"] !== null && Object.keys(child2.child["inherit:props"]).length > 0) {
      let obj = {};
      let pobj = {};
      Object.keys(child2.child["inherit:props"]).filter((a) => child2?.props?.hasOwnProperty(a)).map((a) => obj = { ...obj, [a]: child2?.props?.[a] });
      Object.keys(child2["inherit:props"]).filter((a) => parents?.props?.hasOwnProperty(a)).map((a) => pobj = { ...pobj, [a]: parents?.props?.[a] });
      child2["props"] = {
        ...child2["props"],
        ...pobj
      };
      child2["inherit:props"] = {
        ...child2["inherit:props"],
        ...obj
      };
      child2.child["inherit:props"] = {
        ...child2.child["inherit:props"],
        ...obj
      };
      child2.child["props"] = {
        ...child2["props"],
        ...obj
      };
    }
    if (child2.children.length > 0)
      for (let x2 of child2.children) {
        setProps(x2, props2, value, child2);
      }
    if (child2.hasOwnProperty("child") && child2.child.children.length > 0)
      for (let x2 of child2.child.children) {
        let obj = {};
        let pobj = {};
        Object.keys(child2.child["inherit:props"]).filter((a) => child2?.props?.hasOwnProperty(a)).map((a) => obj = { ...obj, [a]: child2?.props?.[a] });
        Object.keys(child2["inherit:props"]).filter((a) => parents?.props?.hasOwnProperty(a)).map((a) => pobj = { ...pobj, [a]: parents?.props?.[a] });
        child2["props"] = {
          ...child2["props"],
          ...pobj
        };
        child2["inherit:props"] = {
          ...child2["inherit:props"],
          ...obj
        };
        child2.child["inherit:props"] = {
          ...child2.child["inherit:props"],
          ...obj
        };
        child2.child["props"] = {
          ...child2["props"],
          ...obj
        };
        setProps(x2, props2, value, child2);
      }
    updateChild(child2);
  }
  var ComponentClass = {};
  function registerComponentToClassArray(child2) {
    if (child2.hasOwnProperty("@id") && child2["@id"] !== null && ComponentClass.hasOwnProperty(child2["@id"])) {
      ComponentClass[child2["@id"]].push(child2);
    } else if (child2.hasOwnProperty("@id") && child2["@id"] !== null) {
      ComponentClass[child2["@id"]] = [];
      ComponentClass[child2["@id"]].push(child2);
    }
    if (child2.children.length > 0) {
      for (let x2 of child2.children)
        registerComponentToClassArray(x2);
    }
  }
  function getAllContextFrom(component, ctx) {
    ctx = {
      ...component.props
    };
    if (component.children.length > 0)
      for (let x2 of component.children) {
        ctx = Object.assign(ctx, getAllContextFrom(x2, ctx));
      }
    return ctx;
  }
  function find(id) {
    let context = {};
    if (id in ComponentClass)
      for (let x2 of ComponentClass[id]) {
        context = {
          ...context,
          ...x2.props,
          ...getAllContextFrom(x2)
        };
      }
    else {
      console.warn(`@id "${id}" is unknown `);
    }
    return {
      state: new Reactivity(context).create({
        eventSetter(args) {
          if (id in ComponentClass)
            for (let x2 of ComponentClass[id]) {
              setProps(x2, args[1], args[2]);
            }
          else {
            console.warn(`@id "${id}" is unknown `);
          }
        },
        eventGetter(args) {
        }
      }),
      event: new Reactivity(context).create({
        eventSetter(args) {
          if (id in ComponentClass)
            for (let x2 of ComponentClass[id]) {
              if (x2.event.hasOwnProperty(args[1])) {
                x2.event[args[1]] = () => args[2](x2);
                updateChild(x2);
              } else {
                console.log(`event ${args[1]} not defined for component`);
              }
            }
          else {
            console.warn(`@id "${id}" is unknown `);
          }
        },
        eventGetter(args) {
        }
      })
    };
  }
  function updateChild(child2) {
    child2.update();
    if (child2.children.length > 0)
      for (let x2 of child2.children) {
        updateChild(x2);
      }
  }
  var Component = class extends Core {
    constructor() {
      super();
      this.fragment = {};
      this.context = {};
      this.state = {};
    }
    create(name2, inner2) {
      this.fragment = {
        ...this.fragment,
        ...createElement(name2, inner2),
        type: "ParentComponent"
      };
      this.context = {
        ...this.context,
        ...this.fragment.props
      };
      const fragment = this.fragment;
      this.state = new Reactivity(this.context).create({
        eventSetter(args) {
          if (args[0].hasOwnProperty(args[1])) {
            setProps(fragment, args[1], args[2]);
          } else {
            console.warn("props not found!");
          }
        },
        eventGetter(args) {
          return args[0][args[1]];
        }
      });
      return {
        fragment,
        type: "ParentComponent"
      };
    }
    createChild(name2, inner2, beParent = false) {
      let child2 = createElement(name2, inner2);
      if (beParent)
        this.fragment = {
          ...this.fragment,
          ...child2,
          type: "ChildComponent"
        };
      this.context = {
        ...this.context,
        ...child2.props
      };
      const fragment = this.fragment;
      this.state = new Reactivity(this.context).create({
        eventSetter(args) {
          if (args[0].hasOwnProperty(args[1])) {
            setProps(fragment, args[1], args[2]);
          } else {
            console.warn("props not found!");
          }
        },
        eventGetter(args) {
          return args[0][args[1]];
        }
      });
      return {
        ...child2,
        type: "ChildComponent"
      };
    }
    createLoop(name2, inner2) {
      let element2 = loopComponent(name2, inner2, this.rootElement);
      this.context = {
        ...this.context,
        ...element2.props
      };
      const fragment = this.fragment;
      this.state = new Reactivity(this.context).create({
        eventSetter(args) {
          if (args[0].hasOwnProperty(args[1])) {
            setProps(fragment, args[1], args[2]);
          } else {
            console.warn("props not found!");
          }
        },
        eventGetter(args) {
          return args[0][args[1]];
        }
      });
      return {
        ...element2,
        type: "LoopComponent"
      };
    }
    importComponent(child2, props2) {
      let importCom = importComponent(child2.fragment, props2);
      this.context = {
        ...this.context,
        ...child2.context
      };
      const fragment = this.fragment;
      this.state = new Reactivity(this.context).create({
        eventSetter(args) {
          if (args[0].hasOwnProperty(args[1])) {
            setProps(fragment, args[1], args[2]);
          } else {
            console.warn("props not found!");
          }
        },
        eventGetter(args) {
          return args[0][args[1]];
        }
      });
      return {
        ...importCom,
        type: "ChildComponent"
      };
    }
    createCondition(name2, inner2) {
      let element2 = conditionalComponent(name2, inner2);
      this.context = {
        ...this.context,
        ...element2.props
      };
      const fragment = this.fragment;
      this.state = new Reactivity(this.context).create({
        eventSetter(args) {
          if (args[0].hasOwnProperty(args[1])) {
            setProps(fragment, args[1], args[2]);
          } else {
            console.warn("props not found!");
          }
        },
        eventGetter(args) {
          return args[0][args[1]];
        }
      });
      return {
        ...element2,
        type: "conditionComponent"
      };
    }
    rootElement(child2, parent) {
      if (child2.type === "conditionComponent") {
        parent.appendChild(child2.element);
        child2.update();
      } else {
        parent.appendChild(child2.element);
      }
      if (child2.children.length > 0) {
        for (let x2 of child2.children)
          this?.rootElement(x2, child2.element);
      }
    }
    render(target, callback2 = () => {
    }) {
      callback2();
      for (let x2 of this.fragment.children) {
        this.rootElement(x2, this.fragment.element);
      }
      target.appendChild(this.fragment.element);
    }
    destroy(callback2 = () => {
    }) {
      callback2();
      desrtoyChild(this.fragment);
    }
  };
  function StyleSheet(css) {
    if (document.head.querySelector("style") instanceof HTMLStyleElement) {
      document.head.querySelector("style").textContent += document.head.querySelector("style").textContent.replace(/(\n|\t|\r)/igm, "") + css.replace(/(\n|\t|\r)/igm, "");
    } else {
      const style = document.createElement("style");
      style.textContent = css.replace(/(\n|\t|\r)/igm, "");
      document.head.appendChild(style);
    }
  }

