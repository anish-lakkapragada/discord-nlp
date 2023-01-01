
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback, value) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            if (value === undefined) {
                callback(component.$$.ctx[index]);
            }
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const fontLoaded = writable(false);
    const theme = writable('light');

    /* node_modules/sozai/src/components/SozaiApp/SozaiApp.svelte generated by Svelte v3.55.0 */

    const { document: document_1 } = globals;
    const file$i = "node_modules/sozai/src/components/SozaiApp/SozaiApp.svelte";

    // (24:2) {#if !nofont}
    function create_if_block$a(ctx) {
    	let link;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500|Material+Icons&display=swap");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$i, 24, 4, 524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);

    			if (!mounted) {
    				dispose = listen_dev(link, "load", /*load_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(24:2) {#if !nofont}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let t;
    	let div;
    	let current;
    	let if_block = !/*nofont*/ ctx[0] && create_if_block$a(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "sozai-app svelte-fv2905");
    			add_location(div, file$i, 32, 0, 727);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(document_1.head, null);
    			append_dev(document_1.head, if_block_anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*nofont*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			detach_dev(if_block_anchor);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $theme;
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, $$value => $$invalidate(1, $theme = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SozaiApp', slots, ['default']);
    	let { nofont = false } = $$props;
    	const writable_props = ['nofont'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SozaiApp> was created with unknown prop '${key}'`);
    	});

    	const load_handler = () => fontLoaded.set(true);

    	$$self.$$set = $$props => {
    		if ('nofont' in $$props) $$invalidate(0, nofont = $$props.nofont);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fontLoaded, theme, nofont, $theme });

    	$$self.$inject_state = $$props => {
    		if ('nofont' in $$props) $$invalidate(0, nofont = $$props.nofont);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*nofont*/ 1) {
    			if (nofont) {
    				fontLoaded.set(true);
    			}
    		}

    		if ($$self.$$.dirty & /*$theme*/ 2) {
    			document.documentElement.setAttribute('data-theme', $theme);
    		}
    	};

    	return [nofont, $theme, $$scope, slots, load_handler];
    }

    class SozaiApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$i, create_fragment$i, not_equal, { nofont: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SozaiApp",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get nofont() {
    		throw new Error("<SozaiApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nofont(value) {
    		throw new Error("<SozaiApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * From svelte-materialify
     */

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      disabled: false,
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: 'var(--ripple-duration)',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: 'calc(var(--ripple-duration) + 600ms)',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /** @typedef {typeof defaults} RippleOptions */

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {TouchEvent | MouseEvent | KeyboardEvent} e
     * @param {Partial<RippleOptions>} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      /** @type {(e: Event) => e is TouchEvent} */
      // @ts-ignore
      const computeIsTouchEvent = (e) => (e.touches ? e.touches.length : false);

      const isTouchEvent = computeIsTouchEvent(e);
      // Parent element
      const target = /** @type {HTMLElement} */ (
        isTouchEvent ? e.touches[0].target : e.currentTarget
      );

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      if (!opts.disabled) target.appendChild(ripple);
      rippleStyle.opacity = `${opts.opacity}`;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      // idk why but this needs to be setTimeouted or it doesn't work for selects
      setTimeout(() => {
        const targetRect = target.getBoundingClientRect();
        /** @type {(e: Event) => e is KeyboardEvent} */
        const isKeyboardEvent = (e) => opts.centered;
        if (isKeyboardEvent()) {
          rippleStyle.top = `${targetRect.height / 2}px`;
          rippleStyle.left = `${targetRect.width / 2}px`;
        } else {
          const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
          const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
          rippleStyle.top = `${distY - targetRect.top}px`;
          rippleStyle.left = `${distX - targetRect.left}px`;
        }

        // Enlarge ripple
        rippleStyle.transform = `scale(${
      Math.max(targetRect.width, targetRect.height) * 0.02
    }) translate(0,0)`;
      });
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {HTMLElement} ripple
     * @return {Promise<void>}
     */
    function RippleStop(ripple) {
      return new Promise((res, rej) => {
        if (ripple) {
          ripple.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity') {
              ripple.remove();
              res();
            }
          });
          ripple.style.opacity = '0';
        } else {
          rej();
        }
      });
    }

    /**
     * @param {HTMLElement} node
     * @param {Partial<RippleOptions>} _options
     * @returns {{
     *  update: (newOptions: Partial<RippleOptions>) => void, destroy: () => void
     * }}
     */
    var ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      /** @type {Set<HTMLElement>} */
      const ripples = new Set();
      let keyboardActive = false;
      /** @type {(e: KeyboardEvent | TouchEvent | MouseEvent) => void} */
      const handleStart = (e) => {
        ripples.add(RippleStart(e, options));
      };
      const handleStop = () =>
        ripples.forEach((r) => r && RippleStop(r).then(() => ripples.delete(r)));
      /** @type {(e: KeyboardEvent) => void} */
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripples.add(RippleStart(e, { ...options, centered: true }));
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('touchstart', handleStart);
        node.addEventListener('touchend', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('touchstart', handleStart);
        node.removeEventListener('touchend', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /**
     * From SMUI
     * https://github.com/hperrin/svelte-material-ui/blob/273ded17c978ece3dd87f32a58dd9839e5c61325/components/forwardEvents.js
     */

    /**
     * @param {any} component
     * @param {string[]} additionalEvents
     * @returns {(node: HTMLElement) => { destroy: VoidFunction }}
     */
    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus',
        'blur',
        'fullscreenchange',
        'fullscreenerror',
        'scroll',
        'cut',
        'copy',
        'paste',
        'keydown',
        'keypress',
        'keyup',
        'auxclick',
        'click',
        'contextmenu',
        'dblclick',
        'mousedown',
        'mouseenter',
        'mouseleave',
        'mousemove',
        'mouseover',
        'mouseout',
        'mouseup',
        'pointerlockchange',
        'pointerlockerror',
        'select',
        'wheel',
        'drag',
        'dragend',
        'dragenter',
        'dragstart',
        'dragleave',
        'dragover',
        'drop',
        'touchcancel',
        'touchend',
        'touchmove',
        'touchstart',
        'pointerover',
        'pointerenter',
        'pointerdown',
        'pointermove',
        'pointerup',
        'pointercancel',
        'pointerout',
        'pointerleave',
        'gotpointercapture',
        'lostpointercapture',
        ...additionalEvents,
      ];

      /**
       * @param {any} e
       */
      function forward(e) {
        bubble(component, e);
      }

      return (node) => {
        /** @type {Function[]} */
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          },
        };
      };
    }

    const sozaiPalleteColors = new Set([
      'primary',
      'secondary',
      'error',
      'success',
      'alert',
    ]);

    // uses array spread to foil eslint formatting into vertical line
    const materialPalleteColors = new Set([
      ...['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue'],
      ...['cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber'],
      ...['orange', 'deep-orange', 'brown'],
    ]);

    /** @type {(color: string) => string} */
    const getColor = (color) => {
      if (sozaiPalleteColors.has(color)) {
        return `var(--${color}-color)`;
      }
      if (materialPalleteColors.has(color)) {
        return `var(--${color})`;
      }
      return color;
    };

    /* node_modules/sozai/src/components/Icon/Icon.svelte generated by Svelte v3.55.0 */

    const file$h = "node_modules/sozai/src/components/Icon/Icon.svelte";

    function create_fragment$h(ctx) {
    	let i;
    	let i_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "");
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*klass*/ ctx[4]) + " svelte-qwhhjb"));
    			attr_dev(i, "style", /*style_*/ ctx[5]);
    			toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			toggle_class(i, "tip", /*tip*/ ctx[3]);
    			toggle_class(i, "small", /*small*/ ctx[0]);
    			toggle_class(i, "xs", /*xs*/ ctx[1]);
    			add_location(i, file$h, 14, 0, 305);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 16 && i_class_value !== (i_class_value = "" + (null_to_empty(/*klass*/ ctx[4]) + " svelte-qwhhjb"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*style_*/ 32) {
    				attr_dev(i, "style", /*style_*/ ctx[5]);
    			}

    			if (!current || dirty & /*klass, reverse*/ 20) {
    				toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			}

    			if (!current || dirty & /*klass, tip*/ 24) {
    				toggle_class(i, "tip", /*tip*/ ctx[3]);
    			}

    			if (!current || dirty & /*klass, small*/ 17) {
    				toggle_class(i, "small", /*small*/ ctx[0]);
    			}

    			if (!current || dirty & /*klass, xs*/ 18) {
    				toggle_class(i, "xs", /*xs*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let style_;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, ['default']);
    	let { small = false } = $$props;
    	let { xs = false } = $$props;
    	let { reverse = false } = $$props;
    	let { tip = false } = $$props;
    	let { color = '' } = $$props;
    	let { klass = '' } = $$props;
    	let { style = '' } = $$props;
    	const writable_props = ['small', 'xs', 'reverse', 'tip', 'color', 'klass', 'style'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('small' in $$props) $$invalidate(0, small = $$props.small);
    		if ('xs' in $$props) $$invalidate(1, xs = $$props.xs);
    		if ('reverse' in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ('tip' in $$props) $$invalidate(3, tip = $$props.tip);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('klass' in $$props) $$invalidate(4, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(7, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		small,
    		xs,
    		reverse,
    		tip,
    		color,
    		klass,
    		style,
    		style_
    	});

    	$$self.$inject_state = $$props => {
    		if ('small' in $$props) $$invalidate(0, small = $$props.small);
    		if ('xs' in $$props) $$invalidate(1, xs = $$props.xs);
    		if ('reverse' in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ('tip' in $$props) $$invalidate(3, tip = $$props.tip);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('klass' in $$props) $$invalidate(4, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(7, style = $$props.style);
    		if ('style_' in $$props) $$invalidate(5, style_ = $$props.style_);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color, style*/ 192) {
    			$$invalidate(5, style_ = `${color ? `--color: ${color};` : ''} ${style}`.trim());
    		}
    	};

    	return [
    		small,
    		xs,
    		reverse,
    		tip,
    		klass,
    		style_,
    		color,
    		style,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$h, create_fragment$h, not_equal, {
    			small: 0,
    			xs: 1,
    			reverse: 2,
    			tip: 3,
    			color: 6,
    			klass: 4,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get small() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get klass() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set klass(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/Button/Button.svelte generated by Svelte v3.55.0 */
    const file$g = "node_modules/sozai/src/components/Button/Button.svelte";

    // (55:2) {#if icon}
    function create_if_block$9(ctx) {
    	let div;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				small: /*small*/ ctx[5],
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			create_component(icon_1.$$.fragment);
    			attr_dev(div, "class", "icon-content svelte-y7tk4m");
    			add_location(div, file$g, 55, 4, 1372);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*small*/ 32) icon_1_changes.small = /*small*/ ctx[5];

    			if (dirty & /*$$scope, icon*/ 524304) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(55:2) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (57:6) <Icon {small}>
    function create_default_slot$5(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 16) set_data_dev(t, /*icon*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(57:6) <Icon {small}>",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$g(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[4] && create_if_block$9(ctx);
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "s-component s-button " + /*klass*/ ctx[10] + " svelte-y7tk4m");
    			button.disabled = /*disabled*/ ctx[3];
    			attr_dev(button, "style", /*style_*/ ctx[11]);
    			toggle_class(button, "light", /*light*/ ctx[7]);
    			toggle_class(button, "dark", /*dark*/ ctx[8]);
    			toggle_class(button, "block", /*block*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[0]);
    			toggle_class(button, "dense", /*dense*/ ctx[6]);
    			toggle_class(button, "icon", Boolean(/*icon*/ ctx[4]));
    			toggle_class(button, "flat", /*flat*/ ctx[9]);
    			toggle_class(button, "text", /*text*/ ctx[1]);
    			add_location(button, file$g, 38, 0, 1076);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*toggleValue*/ ctx[13], false, false, false),
    					action_destroyer(/*forwardEvents*/ ctx[12].call(null, button)),
    					action_destroyer(ripple_action = ripple.call(null, button, { disabled: /*disabled*/ ctx[3] }))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*icon*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1024 && button_class_value !== (button_class_value = "s-component s-button " + /*klass*/ ctx[10] + " svelte-y7tk4m")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*disabled*/ 8) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (!current || dirty & /*style_*/ 2048) {
    				attr_dev(button, "style", /*style_*/ ctx[11]);
    			}

    			if (ripple_action && is_function(ripple_action.update) && dirty & /*disabled*/ 8) ripple_action.update.call(null, { disabled: /*disabled*/ ctx[3] });

    			if (!current || dirty & /*klass, light*/ 1152) {
    				toggle_class(button, "light", /*light*/ ctx[7]);
    			}

    			if (!current || dirty & /*klass, dark*/ 1280) {
    				toggle_class(button, "dark", /*dark*/ ctx[8]);
    			}

    			if (!current || dirty & /*klass, block*/ 1028) {
    				toggle_class(button, "block", /*block*/ ctx[2]);
    			}

    			if (!current || dirty & /*klass, outlined*/ 1025) {
    				toggle_class(button, "outlined", /*outlined*/ ctx[0]);
    			}

    			if (!current || dirty & /*klass, dense*/ 1088) {
    				toggle_class(button, "dense", /*dense*/ ctx[6]);
    			}

    			if (!current || dirty & /*klass, Boolean, icon*/ 1040) {
    				toggle_class(button, "icon", Boolean(/*icon*/ ctx[4]));
    			}

    			if (!current || dirty & /*klass, flat*/ 1536) {
    				toggle_class(button, "flat", /*flat*/ ctx[9]);
    			}

    			if (!current || dirty & /*klass, text*/ 1026) {
    				toggle_class(button, "text", /*text*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let actualColor;
    	let style_;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { value = false } = $$props;
    	let { color = 'primary' } = $$props;
    	let { outlined = false } = $$props;
    	let { text = false } = $$props;
    	let { block = false } = $$props;
    	let { disabled = false } = $$props;
    	let { icon = null } = $$props;
    	let { small = false } = $$props;
    	let { dense = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { flat = false } = $$props;
    	let { klass = '' } = $$props;
    	let { style = '' } = $$props;

    	// export let iconStyle = '';
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	const toggleValue = () => {
    		$$invalidate(14, value = !value);
    	};

    	const writable_props = [
    		'value',
    		'color',
    		'outlined',
    		'text',
    		'block',
    		'disabled',
    		'icon',
    		'small',
    		'dense',
    		'light',
    		'dark',
    		'flat',
    		'klass',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(14, value = $$props.value);
    		if ('color' in $$props) $$invalidate(15, color = $$props.color);
    		if ('outlined' in $$props) $$invalidate(0, outlined = $$props.outlined);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('block' in $$props) $$invalidate(2, block = $$props.block);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('small' in $$props) $$invalidate(5, small = $$props.small);
    		if ('dense' in $$props) $$invalidate(6, dense = $$props.dense);
    		if ('light' in $$props) $$invalidate(7, light = $$props.light);
    		if ('dark' in $$props) $$invalidate(8, dark = $$props.dark);
    		if ('flat' in $$props) $$invalidate(9, flat = $$props.flat);
    		if ('klass' in $$props) $$invalidate(10, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(16, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		ripple,
    		forwardEventsBuilder,
    		getColor,
    		Icon,
    		value,
    		color,
    		outlined,
    		text,
    		block,
    		disabled,
    		icon,
    		small,
    		dense,
    		light,
    		dark,
    		flat,
    		klass,
    		style,
    		forwardEvents,
    		toggleValue,
    		actualColor,
    		style_
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(14, value = $$props.value);
    		if ('color' in $$props) $$invalidate(15, color = $$props.color);
    		if ('outlined' in $$props) $$invalidate(0, outlined = $$props.outlined);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('block' in $$props) $$invalidate(2, block = $$props.block);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('small' in $$props) $$invalidate(5, small = $$props.small);
    		if ('dense' in $$props) $$invalidate(6, dense = $$props.dense);
    		if ('light' in $$props) $$invalidate(7, light = $$props.light);
    		if ('dark' in $$props) $$invalidate(8, dark = $$props.dark);
    		if ('flat' in $$props) $$invalidate(9, flat = $$props.flat);
    		if ('klass' in $$props) $$invalidate(10, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(16, style = $$props.style);
    		if ('actualColor' in $$props) $$invalidate(17, actualColor = $$props.actualColor);
    		if ('style_' in $$props) $$invalidate(11, style_ = $$props.style_);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 32768) {
    			$$invalidate(17, actualColor = getColor(color));
    		}

    		if ($$self.$$.dirty & /*actualColor, style*/ 196608) {
    			// $: ripple = createRipple((text || outlined) ? actualColor : '#FFFFFF');
    			$$invalidate(11, style_ = `--button-color: ${actualColor}; ${style}`.trim());
    		}
    	};

    	return [
    		outlined,
    		text,
    		block,
    		disabled,
    		icon,
    		small,
    		dense,
    		light,
    		dark,
    		flat,
    		klass,
    		style_,
    		forwardEvents,
    		toggleValue,
    		value,
    		color,
    		style,
    		actualColor,
    		slots,
    		$$scope
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			value: 14,
    			color: 15,
    			outlined: 0,
    			text: 1,
    			block: 2,
    			disabled: 3,
    			icon: 4,
    			small: 5,
    			dense: 6,
    			light: 7,
    			dark: 8,
    			flat: 9,
    			klass: 10,
    			style: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get klass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set klass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/TextField/Label.svelte generated by Svelte v3.55.0 */
    const file$f = "node_modules/sozai/src/components/TextField/Label.svelte";

    function create_fragment$f(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let label;
    	let label_resize_listener;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "outlined-cover svelte-pl77wf");
    			toggle_class(div0, "cover", /*outlined*/ ctx[3] && /*labelOnTop*/ ctx[5]);
    			toggle_class(div0, "loaded", /*loaded*/ ctx[8]);
    			add_location(div0, file$f, 30, 2, 791);
    			attr_dev(label, "for", /*for_*/ ctx[6]);
    			attr_dev(label, "class", "svelte-pl77wf");
    			add_render_callback(() => /*label_elementresize_handler*/ ctx[15].call(label));
    			toggle_class(label, "dense", /*dense*/ ctx[0]);
    			toggle_class(label, "error", /*error*/ ctx[2]);
    			toggle_class(label, "filled", /*filled*/ ctx[4]);
    			toggle_class(label, "outlined", /*outlined*/ ctx[3]);
    			toggle_class(label, "top", /*labelOnTop*/ ctx[5]);
    			toggle_class(label, "focused", /*focused*/ ctx[1]);
    			add_location(label, file$f, 36, 2, 889);
    			attr_dev(div1, "class", "s-label");
    			attr_dev(div1, "style", /*style*/ ctx[9]);
    			add_location(div1, file$f, 29, 0, 759);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			label_resize_listener = add_resize_listener(label, /*label_elementresize_handler*/ ctx[15].bind(label));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*outlined, labelOnTop*/ 40) {
    				toggle_class(div0, "cover", /*outlined*/ ctx[3] && /*labelOnTop*/ ctx[5]);
    			}

    			if (!current || dirty & /*loaded*/ 256) {
    				toggle_class(div0, "loaded", /*loaded*/ ctx[8]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[13],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*for_*/ 64) {
    				attr_dev(label, "for", /*for_*/ ctx[6]);
    			}

    			if (!current || dirty & /*dense*/ 1) {
    				toggle_class(label, "dense", /*dense*/ ctx[0]);
    			}

    			if (!current || dirty & /*error*/ 4) {
    				toggle_class(label, "error", /*error*/ ctx[2]);
    			}

    			if (!current || dirty & /*filled*/ 16) {
    				toggle_class(label, "filled", /*filled*/ ctx[4]);
    			}

    			if (!current || dirty & /*outlined*/ 8) {
    				toggle_class(label, "outlined", /*outlined*/ ctx[3]);
    			}

    			if (!current || dirty & /*labelOnTop*/ 32) {
    				toggle_class(label, "top", /*labelOnTop*/ ctx[5]);
    			}

    			if (!current || dirty & /*focused*/ 2) {
    				toggle_class(label, "focused", /*focused*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(div1, "style", /*style*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			label_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let style;
    	let $fontLoaded;
    	validate_store(fontLoaded, 'fontLoaded');
    	component_subscribe($$self, fontLoaded, $$value => $$invalidate(12, $fontLoaded = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Label', slots, ['default']);
    	let { dense = false } = $$props;
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { outlined = false } = $$props;
    	let { filled = false } = $$props;
    	let { labelOnTop = false } = $$props;
    	let { color = 'primary' } = $$props;
    	let { bgColor = 'var(--app-bg-color)' } = $$props;
    	let { for: for_ = '' } = $$props;
    	let labelWidth = 0;
    	let loaded = false;

    	const writable_props = [
    		'dense',
    		'focused',
    		'error',
    		'outlined',
    		'filled',
    		'labelOnTop',
    		'color',
    		'bgColor',
    		'for'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	function label_elementresize_handler() {
    		labelWidth = this.clientWidth;
    		$$invalidate(7, labelWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('dense' in $$props) $$invalidate(0, dense = $$props.dense);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    		if ('outlined' in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(4, filled = $$props.filled);
    		if ('labelOnTop' in $$props) $$invalidate(5, labelOnTop = $$props.labelOnTop);
    		if ('color' in $$props) $$invalidate(10, color = $$props.color);
    		if ('bgColor' in $$props) $$invalidate(11, bgColor = $$props.bgColor);
    		if ('for' in $$props) $$invalidate(6, for_ = $$props.for);
    		if ('$$scope' in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		fontLoaded,
    		getColor,
    		dense,
    		focused,
    		error,
    		outlined,
    		filled,
    		labelOnTop,
    		color,
    		bgColor,
    		for_,
    		labelWidth,
    		loaded,
    		style,
    		$fontLoaded
    	});

    	$$self.$inject_state = $$props => {
    		if ('dense' in $$props) $$invalidate(0, dense = $$props.dense);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    		if ('outlined' in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(4, filled = $$props.filled);
    		if ('labelOnTop' in $$props) $$invalidate(5, labelOnTop = $$props.labelOnTop);
    		if ('color' in $$props) $$invalidate(10, color = $$props.color);
    		if ('bgColor' in $$props) $$invalidate(11, bgColor = $$props.bgColor);
    		if ('for_' in $$props) $$invalidate(6, for_ = $$props.for_);
    		if ('labelWidth' in $$props) $$invalidate(7, labelWidth = $$props.labelWidth);
    		if ('loaded' in $$props) $$invalidate(8, loaded = $$props.loaded);
    		if ('style' in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*labelWidth, $fontLoaded*/ 4224) {
    			if (labelWidth > 0 && $fontLoaded) {
    				tick().then(() => $$invalidate(8, loaded = true));
    			}
    		}

    		if ($$self.$$.dirty & /*color, bgColor, labelWidth*/ 3200) {
    			$$invalidate(9, style = `--color: ${getColor(color)}; --bg-color: ${bgColor}; --label-width: ${labelWidth}px;`);
    		}
    	};

    	return [
    		dense,
    		focused,
    		error,
    		outlined,
    		filled,
    		labelOnTop,
    		for_,
    		labelWidth,
    		loaded,
    		style,
    		color,
    		bgColor,
    		$fontLoaded,
    		$$scope,
    		slots,
    		label_elementresize_handler
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			dense: 0,
    			focused: 1,
    			error: 2,
    			outlined: 3,
    			filled: 4,
    			labelOnTop: 5,
    			color: 10,
    			bgColor: 11,
    			for: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get dense() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelOnTop() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelOnTop(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get for() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set for(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadIn(t) {
        return t * t;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* node_modules/sozai/src/components/TextField/Hint.svelte generated by Svelte v3.55.0 */
    const file$e = "node_modules/sozai/src/components/TextField/Hint.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*hint*/ ctx[1]);
    			t1 = space();
    			t2 = text(/*error*/ ctx[0]);
    			attr_dev(div, "class", "s-hint svelte-43pkj1");
    			toggle_class(div, "beeg", /*beeg*/ ctx[2]);
    			toggle_class(div, "error", Boolean(/*error*/ ctx[0]));
    			toggle_class(div, "hint", Boolean(/*hint*/ ctx[1]));
    			add_location(div, file$e, 12, 0, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*hint*/ 2) set_data_dev(t0, /*hint*/ ctx[1]);
    			if (!current || dirty & /*error*/ 1) set_data_dev(t2, /*error*/ ctx[0]);

    			if (!current || dirty & /*beeg*/ 4) {
    				toggle_class(div, "beeg", /*beeg*/ ctx[2]);
    			}

    			if (!current || dirty & /*Boolean, error*/ 1) {
    				toggle_class(div, "error", Boolean(/*error*/ ctx[0]));
    			}

    			if (!current || dirty & /*Boolean, hint*/ 2) {
    				toggle_class(div, "hint", Boolean(/*hint*/ ctx[1]));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[3], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[3], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hint', slots, []);
    	let { error = '' } = $$props;
    	let { hint = '' } = $$props;
    	let { beeg = false } = $$props;
    	let { transitionProps = { y: -10, duration: 100, easing: quadOut } } = $$props;
    	const writable_props = ['error', 'hint', 'beeg', 'transitionProps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hint> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('error' in $$props) $$invalidate(0, error = $$props.error);
    		if ('hint' in $$props) $$invalidate(1, hint = $$props.hint);
    		if ('beeg' in $$props) $$invalidate(2, beeg = $$props.beeg);
    		if ('transitionProps' in $$props) $$invalidate(3, transitionProps = $$props.transitionProps);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		quadOut,
    		error,
    		hint,
    		beeg,
    		transitionProps
    	});

    	$$self.$inject_state = $$props => {
    		if ('error' in $$props) $$invalidate(0, error = $$props.error);
    		if ('hint' in $$props) $$invalidate(1, hint = $$props.hint);
    		if ('beeg' in $$props) $$invalidate(2, beeg = $$props.beeg);
    		if ('transitionProps' in $$props) $$invalidate(3, transitionProps = $$props.transitionProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [error, hint, beeg, transitionProps];
    }

    class Hint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$e, create_fragment$e, not_equal, {
    			error: 0,
    			hint: 1,
    			beeg: 2,
    			transitionProps: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hint",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get error() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beeg() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beeg(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionProps() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionProps(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/TextField/Underline.svelte generated by Svelte v3.55.0 */
    const file$d = "node_modules/sozai/src/components/TextField/Underline.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "line svelte-11ecgpe");
    			toggle_class(div0, "focused", /*focused*/ ctx[2]);
    			toggle_class(div0, "error", /*error*/ ctx[3]);
    			add_location(div0, file$d, 13, 2, 347);
    			attr_dev(div1, "class", "line-container svelte-11ecgpe");
    			attr_dev(div1, "style", /*style*/ ctx[4]);
    			toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			add_location(div1, file$d, 12, 0, 269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*focused*/ 4) {
    				toggle_class(div0, "focused", /*focused*/ ctx[2]);
    			}

    			if (dirty & /*error*/ 8) {
    				toggle_class(div0, "error", /*error*/ ctx[3]);
    			}

    			if (dirty & /*style*/ 16) {
    				attr_dev(div1, "style", /*style*/ ctx[4]);
    			}

    			if (dirty & /*noUnderline, outlined*/ 3) {
    				toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Underline', slots, []);
    	let { noUnderline = false } = $$props;
    	let { outlined = false } = $$props;
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { color = 'primary' } = $$props;
    	const writable_props = ['noUnderline', 'outlined', 'focused', 'error', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Underline> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('noUnderline' in $$props) $$invalidate(0, noUnderline = $$props.noUnderline);
    		if ('outlined' in $$props) $$invalidate(1, outlined = $$props.outlined);
    		if ('focused' in $$props) $$invalidate(2, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(3, error = $$props.error);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getColor,
    		noUnderline,
    		outlined,
    		focused,
    		error,
    		color,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('noUnderline' in $$props) $$invalidate(0, noUnderline = $$props.noUnderline);
    		if ('outlined' in $$props) $$invalidate(1, outlined = $$props.outlined);
    		if ('focused' in $$props) $$invalidate(2, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(3, error = $$props.error);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    		if ('style' in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 32) {
    			$$invalidate(4, style = `--color: ${getColor(color)}`);
    		}
    	};

    	return [noUnderline, outlined, focused, error, style, color];
    }

    class Underline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			noUnderline: 0,
    			outlined: 1,
    			focused: 2,
    			error: 3,
    			color: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Underline",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get noUnderline() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/TextField/TextField.svelte generated by Svelte v3.55.0 */
    const file$c = "node_modules/sozai/src/components/TextField/TextField.svelte";
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (57:2) {#if label}
    function create_if_block_3(ctx) {
    	let current;
    	const label_slot_template = /*#slots*/ ctx[26].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[29], get_label_slot_context);
    	const label_slot_or_fallback = label_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (label_slot_or_fallback) label_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (label_slot_or_fallback) {
    				label_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (label_slot) {
    				if (label_slot.p && (!current || dirty & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						label_slot,
    						label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[29],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[29])
    						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[29], dirty, get_label_slot_changes),
    						get_label_slot_context
    					);
    				}
    			} else {
    				if (label_slot_or_fallback && label_slot_or_fallback.p && (!current || dirty & /*labelOnTop, dense, focused, error, outlined, filled, color, bgColor, id, label*/ 1182646)) {
    					label_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(57:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (59:6) <Label         {labelOnTop}         {dense}         {focused}         error={Boolean(error)}         {outlined}         {filled}         {color}         {bgColor}         for={id}       >
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 32) set_data_dev(t, /*label*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(59:6) <Label         {labelOnTop}         {dense}         {focused}         error={Boolean(error)}         {outlined}         {filled}         {color}         {bgColor}         for={id}       >",
    		ctx
    	});

    	return block;
    }

    // (58:23)        
    function fallback_block$1(ctx) {
    	let label_1;
    	let current;

    	label_1 = new Label({
    			props: {
    				labelOnTop: /*labelOnTop*/ ctx[20],
    				dense: /*dense*/ ctx[9],
    				focused: /*focused*/ ctx[1],
    				error: Boolean(/*error*/ ctx[11]),
    				outlined: /*outlined*/ ctx[7],
    				filled: /*filled*/ ctx[8],
    				color: /*color*/ ctx[4],
    				bgColor: /*bgColor*/ ctx[17],
    				for: /*id*/ ctx[2],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_1_changes = {};
    			if (dirty & /*labelOnTop*/ 1048576) label_1_changes.labelOnTop = /*labelOnTop*/ ctx[20];
    			if (dirty & /*dense*/ 512) label_1_changes.dense = /*dense*/ ctx[9];
    			if (dirty & /*focused*/ 2) label_1_changes.focused = /*focused*/ ctx[1];
    			if (dirty & /*error*/ 2048) label_1_changes.error = Boolean(/*error*/ ctx[11]);
    			if (dirty & /*outlined*/ 128) label_1_changes.outlined = /*outlined*/ ctx[7];
    			if (dirty & /*filled*/ 256) label_1_changes.filled = /*filled*/ ctx[8];
    			if (dirty & /*color*/ 16) label_1_changes.color = /*color*/ ctx[4];
    			if (dirty & /*bgColor*/ 131072) label_1_changes.bgColor = /*bgColor*/ ctx[17];
    			if (dirty & /*id*/ 4) label_1_changes.for = /*id*/ ctx[2];

    			if (dirty & /*$$scope, label*/ 536870944) {
    				label_1_changes.$$scope = { dirty, ctx };
    			}

    			label_1.$set(label_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(58:23)        ",
    		ctx
    	});

    	return block;
    }

    // (91:32) 
    function create_if_block_2(ctx) {
    	let textarea_1;
    	let textarea_1_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			attr_dev(textarea_1, "rows", /*rows*/ ctx[13]);
    			attr_dev(textarea_1, "aria-label", /*label*/ ctx[5]);
    			attr_dev(textarea_1, "class", "s-input textarea svelte-gom8kx");
    			textarea_1.disabled = /*disabled*/ ctx[18];
    			attr_dev(textarea_1, "id", /*id*/ ctx[2]);
    			attr_dev(textarea_1, "placeholder", textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[6] : '');
    			toggle_class(textarea_1, "dense", /*dense*/ ctx[9]);
    			toggle_class(textarea_1, "filled", /*filled*/ ctx[8]);
    			toggle_class(textarea_1, "outlined", /*outlined*/ ctx[7]);
    			toggle_class(textarea_1, "error", /*error*/ ctx[11]);
    			add_location(textarea_1, file$c, 91, 4, 2284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    			set_input_value(textarea_1, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[28]),
    					listen_dev(textarea_1, "focus", /*toggleFocus*/ ctx[22], false, false, false),
    					listen_dev(textarea_1, "blur", /*toggleFocus*/ ctx[22], false, false, false),
    					action_destroyer(/*forwardEvents*/ ctx[23].call(null, textarea_1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows*/ 8192) {
    				attr_dev(textarea_1, "rows", /*rows*/ ctx[13]);
    			}

    			if (dirty & /*label*/ 32) {
    				attr_dev(textarea_1, "aria-label", /*label*/ ctx[5]);
    			}

    			if (dirty & /*disabled*/ 262144) {
    				prop_dev(textarea_1, "disabled", /*disabled*/ ctx[18]);
    			}

    			if (dirty & /*id*/ 4) {
    				attr_dev(textarea_1, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*value, placeholder*/ 65 && textarea_1_placeholder_value !== (textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[6] : '')) {
    				attr_dev(textarea_1, "placeholder", textarea_1_placeholder_value);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}

    			if (dirty & /*dense*/ 512) {
    				toggle_class(textarea_1, "dense", /*dense*/ ctx[9]);
    			}

    			if (dirty & /*filled*/ 256) {
    				toggle_class(textarea_1, "filled", /*filled*/ ctx[8]);
    			}

    			if (dirty & /*outlined*/ 128) {
    				toggle_class(textarea_1, "outlined", /*outlined*/ ctx[7]);
    			}

    			if (dirty & /*error*/ 2048) {
    				toggle_class(textarea_1, "error", /*error*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(91:32) ",
    		ctx
    	});

    	return block;
    }

    // (75:2) {#if (!textarea && !select) || autocomplete}
    function create_if_block_1$2(ctx) {
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "aria-label", /*label*/ ctx[5]);
    			attr_dev(input, "class", "s-input svelte-gom8kx");
    			input.disabled = /*disabled*/ ctx[18];
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "placeholder", input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[6] : '');
    			toggle_class(input, "dense", /*dense*/ ctx[9]);
    			toggle_class(input, "filled", /*filled*/ ctx[8]);
    			toggle_class(input, "outlined", /*outlined*/ ctx[7]);
    			toggle_class(input, "error", /*error*/ ctx[11]);
    			add_location(input, file$c, 75, 4, 1938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[27]),
    					listen_dev(input, "focus", /*toggleFocus*/ ctx[22], false, false, false),
    					listen_dev(input, "blur", /*toggleFocus*/ ctx[22], false, false, false),
    					action_destroyer(/*forwardEvents*/ ctx[23].call(null, input))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 32) {
    				attr_dev(input, "aria-label", /*label*/ ctx[5]);
    			}

    			if (dirty & /*disabled*/ 262144) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[18]);
    			}

    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*value, placeholder*/ 65 && input_placeholder_value !== (input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[6] : '')) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*dense*/ 512) {
    				toggle_class(input, "dense", /*dense*/ ctx[9]);
    			}

    			if (dirty & /*filled*/ 256) {
    				toggle_class(input, "filled", /*filled*/ ctx[8]);
    			}

    			if (dirty & /*outlined*/ 128) {
    				toggle_class(input, "outlined", /*outlined*/ ctx[7]);
    			}

    			if (dirty & /*error*/ 2048) {
    				toggle_class(input, "error", /*error*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(75:2) {#if (!textarea && !select) || autocomplete}",
    		ctx
    	});

    	return block;
    }

    // (118:2) {#if showHint}
    function create_if_block$8(ctx) {
    	let hint_1;
    	let current;

    	hint_1 = new Hint({
    			props: {
    				error: /*error*/ ctx[11],
    				hint: /*hint*/ ctx[10],
    				beeg: /*outlined*/ ctx[7] || /*filled*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hint_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hint_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hint_1_changes = {};
    			if (dirty & /*error*/ 2048) hint_1_changes.error = /*error*/ ctx[11];
    			if (dirty & /*hint*/ 1024) hint_1_changes.hint = /*hint*/ ctx[10];
    			if (dirty & /*outlined, filled*/ 384) hint_1_changes.beeg = /*outlined*/ ctx[7] || /*filled*/ ctx[8];
    			hint_1.$set(hint_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hint_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hint_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hint_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(118:2) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let underline;
    	let t2;
    	let div_class_value;
    	let current;
    	let if_block0 = /*label*/ ctx[5] && create_if_block_3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*textarea*/ ctx[12] && !/*select*/ ctx[14] || /*autocomplete*/ ctx[15]) return create_if_block_1$2;
    		if (/*textarea*/ ctx[12] && !/*select*/ ctx[14]) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	underline = new Underline({
    			props: {
    				noUnderline: /*noUnderline*/ ctx[16],
    				outlined: /*outlined*/ ctx[7],
    				focused: /*focused*/ ctx[1],
    				error: Boolean(/*error*/ ctx[11]),
    				color: /*color*/ ctx[4]
    			},
    			$$inline: true
    		});

    	let if_block2 = /*showHint*/ ctx[21] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(underline.$$.fragment);
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", div_class_value = "s-component s-input-container " + /*klass*/ ctx[19] + " svelte-gom8kx");
    			attr_dev(div, "style", /*style*/ ctx[3]);
    			add_location(div, file$c, 55, 0, 1543);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			mount_component(underline, div, null);
    			append_dev(div, t2);
    			if (if_block2) if_block2.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*label*/ 32) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			}

    			const underline_changes = {};
    			if (dirty & /*noUnderline*/ 65536) underline_changes.noUnderline = /*noUnderline*/ ctx[16];
    			if (dirty & /*outlined*/ 128) underline_changes.outlined = /*outlined*/ ctx[7];
    			if (dirty & /*focused*/ 2) underline_changes.focused = /*focused*/ ctx[1];
    			if (dirty & /*error*/ 2048) underline_changes.error = Boolean(/*error*/ ctx[11]);
    			if (dirty & /*color*/ 16) underline_changes.color = /*color*/ ctx[4];
    			underline.$set(underline_changes);

    			if (/*showHint*/ ctx[21]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*showHint*/ 2097152) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$8(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*klass*/ 524288 && div_class_value !== (div_class_value = "s-component s-input-container " + /*klass*/ ctx[19] + " svelte-gom8kx")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 8) {
    				attr_dev(div, "style", /*style*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(underline.$$.fragment, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(underline.$$.fragment, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			destroy_component(underline);
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let amountCreated = 0;

    function instance$c($$self, $$props, $$invalidate) {
    	let showHint;
    	let labelOnTop;
    	let actualColor;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextField', slots, ['label']);
    	let { value = '' } = $$props;
    	let { color = 'primary' } = $$props;
    	let { label = '' } = $$props;
    	let { placeholder = '' } = $$props;
    	let { outlined = false } = $$props;
    	let { filled = false } = $$props;
    	let { dense = false } = $$props;
    	let { hint = '' } = $$props;
    	let { error = '' } = $$props;
    	let { persistentHint = false } = $$props;
    	let { textarea = false } = $$props;
    	let { rows = 6 } = $$props;
    	let { select = false } = $$props;
    	let { autocomplete = false } = $$props;
    	let { noUnderline = false } = $$props;
    	let { bgColor = 'var(--app-bg-color)' } = $$props;
    	let { disabled = false } = $$props;
    	let { focused = false } = $$props;
    	let { klass = '' } = $$props;
    	let { style = '' } = $$props;
    	let { id = '' } = $$props;

    	const toggleFocus = () => {
    		$$invalidate(1, focused = !focused);
    	};

    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	const writable_props = [
    		'value',
    		'color',
    		'label',
    		'placeholder',
    		'outlined',
    		'filled',
    		'dense',
    		'hint',
    		'error',
    		'persistentHint',
    		'textarea',
    		'rows',
    		'select',
    		'autocomplete',
    		'noUnderline',
    		'bgColor',
    		'disabled',
    		'focused',
    		'klass',
    		'style',
    		'id'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextField> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('label' in $$props) $$invalidate(5, label = $$props.label);
    		if ('placeholder' in $$props) $$invalidate(6, placeholder = $$props.placeholder);
    		if ('outlined' in $$props) $$invalidate(7, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(8, filled = $$props.filled);
    		if ('dense' in $$props) $$invalidate(9, dense = $$props.dense);
    		if ('hint' in $$props) $$invalidate(10, hint = $$props.hint);
    		if ('error' in $$props) $$invalidate(11, error = $$props.error);
    		if ('persistentHint' in $$props) $$invalidate(24, persistentHint = $$props.persistentHint);
    		if ('textarea' in $$props) $$invalidate(12, textarea = $$props.textarea);
    		if ('rows' in $$props) $$invalidate(13, rows = $$props.rows);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('autocomplete' in $$props) $$invalidate(15, autocomplete = $$props.autocomplete);
    		if ('noUnderline' in $$props) $$invalidate(16, noUnderline = $$props.noUnderline);
    		if ('bgColor' in $$props) $$invalidate(17, bgColor = $$props.bgColor);
    		if ('disabled' in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('klass' in $$props) $$invalidate(19, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('$$scope' in $$props) $$invalidate(29, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		amountCreated,
    		get_current_component,
    		forwardEventsBuilder,
    		getColor,
    		Label,
    		Hint,
    		Underline,
    		value,
    		color,
    		label,
    		placeholder,
    		outlined,
    		filled,
    		dense,
    		hint,
    		error,
    		persistentHint,
    		textarea,
    		rows,
    		select,
    		autocomplete,
    		noUnderline,
    		bgColor,
    		disabled,
    		focused,
    		klass,
    		style,
    		id,
    		toggleFocus,
    		forwardEvents,
    		actualColor,
    		labelOnTop,
    		showHint
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('label' in $$props) $$invalidate(5, label = $$props.label);
    		if ('placeholder' in $$props) $$invalidate(6, placeholder = $$props.placeholder);
    		if ('outlined' in $$props) $$invalidate(7, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(8, filled = $$props.filled);
    		if ('dense' in $$props) $$invalidate(9, dense = $$props.dense);
    		if ('hint' in $$props) $$invalidate(10, hint = $$props.hint);
    		if ('error' in $$props) $$invalidate(11, error = $$props.error);
    		if ('persistentHint' in $$props) $$invalidate(24, persistentHint = $$props.persistentHint);
    		if ('textarea' in $$props) $$invalidate(12, textarea = $$props.textarea);
    		if ('rows' in $$props) $$invalidate(13, rows = $$props.rows);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('autocomplete' in $$props) $$invalidate(15, autocomplete = $$props.autocomplete);
    		if ('noUnderline' in $$props) $$invalidate(16, noUnderline = $$props.noUnderline);
    		if ('bgColor' in $$props) $$invalidate(17, bgColor = $$props.bgColor);
    		if ('disabled' in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('klass' in $$props) $$invalidate(19, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('actualColor' in $$props) $$invalidate(25, actualColor = $$props.actualColor);
    		if ('labelOnTop' in $$props) $$invalidate(20, labelOnTop = $$props.labelOnTop);
    		if ('showHint' in $$props) $$invalidate(21, showHint = $$props.showHint);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 4) {
    			if (id === '') {
    				$$invalidate(2, id = `s-text-input-${amountCreated++}`);
    			}
    		}

    		if ($$self.$$.dirty & /*error, persistentHint, hint, focused*/ 16780290) {
    			$$invalidate(21, showHint = error || (persistentHint ? hint : focused && hint));
    		}

    		if ($$self.$$.dirty & /*placeholder, focused, value*/ 67) {
    			$$invalidate(20, labelOnTop = Boolean(placeholder || focused || value));
    		}

    		if ($$self.$$.dirty & /*color*/ 16) {
    			$$invalidate(25, actualColor = getColor(color));
    		}

    		if ($$self.$$.dirty & /*actualColor*/ 33554432) {
    			$$invalidate(3, style = `--color: ${actualColor}`);
    		}
    	};

    	return [
    		value,
    		focused,
    		id,
    		style,
    		color,
    		label,
    		placeholder,
    		outlined,
    		filled,
    		dense,
    		hint,
    		error,
    		textarea,
    		rows,
    		select,
    		autocomplete,
    		noUnderline,
    		bgColor,
    		disabled,
    		klass,
    		labelOnTop,
    		showHint,
    		toggleFocus,
    		forwardEvents,
    		persistentHint,
    		actualColor,
    		slots,
    		input_input_handler,
    		textarea_1_input_handler,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			value: 0,
    			color: 4,
    			label: 5,
    			placeholder: 6,
    			outlined: 7,
    			filled: 8,
    			dense: 9,
    			hint: 10,
    			error: 11,
    			persistentHint: 24,
    			textarea: 12,
    			rows: 13,
    			select: 14,
    			autocomplete: 15,
    			noUnderline: 16,
    			bgColor: 17,
    			disabled: 18,
    			focused: 1,
    			klass: 19,
    			style: 3,
    			id: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noUnderline() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get klass() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set klass(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/Util/Scrim.svelte generated by Svelte v3.55.0 */
    const file$b = "node_modules/sozai/src/components/Util/Scrim.svelte";

    // (13:0) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "s-scrim svelte-1hkqwhp");
    			set_style(div, "opacity", /*opacity*/ ctx[0]);
    			add_location(div, file$b, 13, 2, 388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*opacity*/ 1) {
    				set_style(div, "opacity", /*opacity*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fade, /*inProps*/ ctx[1]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, /*outProps*/ ctx[2]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(13:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if notransition}
    function create_if_block$7(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "s-scrim svelte-1hkqwhp");
    			set_style(div, "opacity", /*opacity*/ ctx[0]);
    			add_location(div, file$b, 11, 2, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*opacity*/ 1) {
    				set_style(div, "opacity", /*opacity*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(11:0) {#if notransition}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*notransition*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scrim', slots, []);
    	let { opacity = 0.5 } = $$props;
    	let { inProps = { duration: 200, easing: quadIn } } = $$props;
    	let { outProps = { duration: 200, easing: quadOut } } = $$props;
    	let { notransition = false } = $$props;
    	const writable_props = ['opacity', 'inProps', 'outProps', 'notransition'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scrim> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('opacity' in $$props) $$invalidate(0, opacity = $$props.opacity);
    		if ('inProps' in $$props) $$invalidate(1, inProps = $$props.inProps);
    		if ('outProps' in $$props) $$invalidate(2, outProps = $$props.outProps);
    		if ('notransition' in $$props) $$invalidate(3, notransition = $$props.notransition);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		quadOut,
    		quadIn,
    		opacity,
    		inProps,
    		outProps,
    		notransition
    	});

    	$$self.$inject_state = $$props => {
    		if ('opacity' in $$props) $$invalidate(0, opacity = $$props.opacity);
    		if ('inProps' in $$props) $$invalidate(1, inProps = $$props.inProps);
    		if ('outProps' in $$props) $$invalidate(2, outProps = $$props.outProps);
    		if ('notransition' in $$props) $$invalidate(3, notransition = $$props.notransition);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [opacity, inProps, outProps, notransition, click_handler, click_handler_1];
    }

    class Scrim extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			opacity: 0,
    			inProps: 1,
    			outProps: 2,
    			notransition: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scrim",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get opacity() {
    		throw new Error("<Scrim>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Scrim>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inProps() {
    		throw new Error("<Scrim>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inProps(value) {
    		throw new Error("<Scrim>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outProps() {
    		throw new Error("<Scrim>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outProps(value) {
    		throw new Error("<Scrim>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notransition() {
    		throw new Error("<Scrim>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notransition(value) {
    		throw new Error("<Scrim>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/Dialog/Dialog.svelte generated by Svelte v3.55.0 */
    const file$a = "node_modules/sozai/src/components/Dialog/Dialog.svelte";
    const get_actions_slot_changes = dirty => ({});
    const get_actions_slot_context = ctx => ({});
    const get_title_slot_changes$1 = dirty => ({});
    const get_title_slot_context$1 = ctx => ({});

    // (18:0) {#if value}
    function create_if_block$6(ctx) {
    	let div4;
    	let scrim;
    	let t0;
    	let div3;
    	let div2;
    	let div0;
    	let t1;
    	let t2;
    	let div1;
    	let div2_intro;
    	let div4_class_value;
    	let current;

    	scrim = new Scrim({
    			props: { opacity: /*opacity*/ ctx[1] },
    			$$inline: true
    		});

    	scrim.$on("click", /*click_handler*/ ctx[9]);
    	const title_slot_template = /*#slots*/ ctx[8].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[7], get_title_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	const actions_slot_template = /*#slots*/ ctx[8].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[7], get_actions_slot_context);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			create_component(scrim.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if (title_slot) title_slot.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			div1 = element("div");
    			if (actions_slot) actions_slot.c();
    			attr_dev(div0, "class", "title svelte-dffwcc");
    			add_location(div0, file$a, 22, 8, 731);
    			attr_dev(div1, "class", "actions svelte-dffwcc");
    			add_location(div1, file$a, 26, 8, 823);
    			attr_dev(div2, "class", "s-dialog svelte-dffwcc");
    			add_location(div2, file$a, 21, 6, 673);
    			attr_dev(div3, "class", "s-dialog-container svelte-dffwcc");
    			add_location(div3, file$a, 20, 4, 634);
    			attr_dev(div4, "class", div4_class_value = "s-component s-dialog-overlay " + /*klass*/ ctx[3] + " svelte-dffwcc");
    			attr_dev(div4, "style", /*style*/ ctx[5]);
    			add_location(div4, file$a, 18, 2, 499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			mount_component(scrim, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (title_slot) {
    				title_slot.m(div0, null);
    			}

    			append_dev(div2, t1);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (actions_slot) {
    				actions_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const scrim_changes = {};
    			if (dirty & /*opacity*/ 2) scrim_changes.opacity = /*opacity*/ ctx[1];
    			scrim.$set(scrim_changes);

    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[7], dirty, get_title_slot_changes$1),
    						get_title_slot_context$1
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			if (actions_slot) {
    				if (actions_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						actions_slot,
    						actions_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(actions_slot_template, /*$$scope*/ ctx[7], dirty, get_actions_slot_changes),
    						get_actions_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 8 && div4_class_value !== (div4_class_value = "s-component s-dialog-overlay " + /*klass*/ ctx[3] + " svelte-dffwcc")) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(div4, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrim.$$.fragment, local);
    			transition_in(title_slot, local);
    			transition_in(default_slot, local);
    			transition_in(actions_slot, local);

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, scale, /*transitionProps*/ ctx[4]);
    					div2_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrim.$$.fragment, local);
    			transition_out(title_slot, local);
    			transition_out(default_slot, local);
    			transition_out(actions_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(scrim);
    			if (title_slot) title_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (actions_slot) actions_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(18:0) {#if value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*value*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*value*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*value*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dialog', slots, ['title','default','actions']);
    	let { value = false } = $$props;
    	let { opacity = 0.5 } = $$props;
    	let { persistent = false } = $$props;
    	let { color = 'var(--dialog-bg-color)' } = $$props;
    	let { klass = '' } = $$props;

    	let { transitionProps = {
    		duration: 150,
    		easing: quadIn,
    		delay: 150
    	} } = $$props;

    	const writable_props = ['value', 'opacity', 'persistent', 'color', 'klass', 'transitionProps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => !persistent && $$invalidate(0, value = false);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('opacity' in $$props) $$invalidate(1, opacity = $$props.opacity);
    		if ('persistent' in $$props) $$invalidate(2, persistent = $$props.persistent);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('klass' in $$props) $$invalidate(3, klass = $$props.klass);
    		if ('transitionProps' in $$props) $$invalidate(4, transitionProps = $$props.transitionProps);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		quadIn,
    		Scrim,
    		getColor,
    		value,
    		opacity,
    		persistent,
    		color,
    		klass,
    		transitionProps,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('opacity' in $$props) $$invalidate(1, opacity = $$props.opacity);
    		if ('persistent' in $$props) $$invalidate(2, persistent = $$props.persistent);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('klass' in $$props) $$invalidate(3, klass = $$props.klass);
    		if ('transitionProps' in $$props) $$invalidate(4, transitionProps = $$props.transitionProps);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 64) {
    			$$invalidate(5, style = `--color: ${getColor(color)}`);
    		}
    	};

    	return [
    		value,
    		opacity,
    		persistent,
    		klass,
    		transitionProps,
    		style,
    		color,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			value: 0,
    			opacity: 1,
    			persistent: 2,
    			color: 6,
    			klass: 3,
    			transitionProps: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get value() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistent() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistent(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get klass() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set klass(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionProps() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionProps(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const listKey = Symbol();

    /**
     * @template T
     * @typedef {import('svelte/store').Readable<T>} Readable<T>
     */
    /**
     * @template T
     * @typedef {import('svelte/store').Writable<T>} Writable<T>
     */

    /** @typedef {'destroy' | 'click'} GroupMSGType */
    /** @typedef {{ type: GroupMSGType, element: Element }} GroupMSG */
    /** @typedef {{ type: 'is-parent', element: Element}} ParentConfirmMSG*/
    /** @typedef {{ type: 'set-selected', selected: boolean }} SetSelectedMSG */
    /** @typedef {ParentConfirmMSG | SetSelectedMSG} GroupItemMSG */
    /** @typedef {{ key: symbol, element: Element }} ChildCreate */

    /** @type {Map<Element, Writable<GroupMSG | null>>} */
    const groups = new Map();

    /** @type {Map<Element, Writable<GroupItemMSG | null>>} */
    const groupItems = new Map();

    /** @type {(e: any) => e is CustomEvent<ChildCreate>} */
    const isChildCreateEvent = (e) =>
      e.detail && 'key' in e.detail && 'element' in e.detail;

    /** @type {(n1: Element, n2: Element) => number} */
    const documentPositionComparator = (n1, n2) =>
      n1.compareDocumentPosition(n2) === 4 ? -1 : 1;

    /**
     * Parent of a selectable group.
     *
     * @param {symbol} key group key
     * @param {Element} element element representing group parent
     * @param {Readable<boolean>} selectable whether group is selectable
     * @param {Readable<boolean>} multiselect whether to allow multiselect
     * @param {Writable<number[]>} selected indexes that are selected
     * @returns {{ destroy: VoidFunction  }}
     */
    const group = (key, element, selectable, multiselect, selected) => {
      /** @type {Writable<GroupMSG | null>} */
      const channel = writable();
      groups.set(element, channel);

      const unsortedChildren = writable(/** @type {Element[]} */ ([]));
      const children = derived(unsortedChildren, ($c) =>
        [...$c].sort(documentPositionComparator)
      );
      const childrenIndex = derived(
        children,
        ($children) => new Map($children.map((child, i) => [child, i]))
      );

      const cleanUpUpdateSelected = derived(
        [childrenIndex, selected],
        (x) => x
      ).subscribe(([$childrenIndex, $selected]) => {
        const selectedSet = new Set($selected);
        $childrenIndex.forEach((i, child) => {
          groupItems
            .get(child)
            ?.set({ type: 'set-selected', selected: selectedSet.has(i) });
        });
      });

      const cleanUpChannel = channel.subscribe((msg) => {
        if (!msg) return;
        if (msg.type === 'click') {
          if (!get_store_value(selectable)) return;
          const index = get_store_value(childrenIndex)?.get(msg.element);
          const currentlySelected = get_store_value(selected);
          if (index === undefined) return;
          const isCurrentlySelected = currentlySelected.includes(index);
          if (get_store_value(multiselect) && isCurrentlySelected) {
            selected.set(currentlySelected.filter((el) => el !== index));
            return;
          }
          if (get_store_value(multiselect)) {
            selected.set([...currentlySelected, index].sort());
            return;
          }
          selected.set([index]);
        }
      });

      /** @type {(e: Event) => void} */
      const onNewGroupItem = (e) => {
        if (isChildCreateEvent(e) && e.detail.key === key) {
          e.stopPropagation();
          unsortedChildren.set([...get_store_value(children), e.detail.element]);
          groupItems.get(e.detail.element)?.set({ type: 'is-parent', element });
        }
      };

      element.addEventListener('newGroupItem', onNewGroupItem);

      const destroy = () => {
        groups.delete(element);
        element.removeEventListener('newGroupItem', onNewGroupItem);
        cleanUpChannel();
        cleanUpUpdateSelected();
      };

      return { destroy };
    };

    /**
     * Selectable group item.
     *
     * @param {symbol} key group type key
     * @param {Element} element element associated with group item
     * @returns {{ destroy: VoidFunction, selected: Readable<boolean> }}
     */
    const groupItem = (key, element) => {
      /** @type {Writable<GroupItemMSG | null>} */
      const channel = writable(null);
      groupItems.set(element, channel);

      const selected = writable(false);
      const parent = readable(/** @type {Element | null} */ (null), (set) => {
        setTimeout(() => {
          element.dispatchEvent(
            new CustomEvent('newGroupItem', {
              detail: { key, element },
              bubbles: true,
              cancelable: true,
              composed: false,
            })
          );
        });

        return channel.subscribe((msg) => {
          if (!msg) return;
          if (msg.type === 'is-parent') {
            set(msg.element);
          }
        });
      });

      const parentFindCleanUp = parent.subscribe(noop);

      /** @type {(msg: GroupMSG) => void} */
      const sendParentMessage = (msg) => {
        const cleanUp = parent.subscribe((el) => {
          if (!el) return;
          groups.get(el)?.set(msg);
          setTimeout(() => cleanUp());
        });
      };

      const onClick = () => {
        sendParentMessage({ type: 'click', element });
      };

      element.addEventListener('click', onClick);

      const cleanUpChannel = channel.subscribe((msg) => {
        if (!msg) return;
        if (msg.type === 'set-selected') {
          selected.set(msg.selected);
        }
      });

      const destroy = () => {
        groupItems.delete(element);
        element.removeEventListener('click', onClick);
        cleanUpChannel();
        parentFindCleanUp();
        sendParentMessage({ type: 'destroy', element });
      };

      return { destroy, selected };
    };

    /* node_modules/sozai/src/components/List/List.svelte generated by Svelte v3.55.0 */
    const file$9 = "node_modules/sozai/src/components/List/List.svelte";

    function create_fragment$9(ctx) {
    	let ul_1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			ul_1 = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul_1, "class", "s-component s-list svelte-5tzrii");
    			add_location(ul_1, file$9, 45, 0, 1063);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul_1, anchor);

    			if (default_slot) {
    				default_slot.m(ul_1, null);
    			}

    			/*ul_1_binding*/ ctx[8](ul_1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul_1);
    			if (default_slot) default_slot.d(detaching);
    			/*ul_1_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $indexesSelected;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, ['default']);
    	let { selectable = false } = $$props;
    	let { multiselect = false } = $$props;
    	let { selected = [0].slice(1) } = $$props;
    	const dispatch = createEventDispatcher();

    	/** @type {Element | undefined}*/
    	let ul;

    	const isSelectable = writable(selectable);
    	const isMultiselect = writable(multiselect);
    	const indexesSelected = writable(selected);
    	validate_store(indexesSelected, 'indexesSelected');
    	component_subscribe($$self, indexesSelected, value => $$invalidate(5, $indexesSelected = value));
    	setContext(listKey, { selectable: isSelectable });

    	onMount(() => {
    		if (!ul) return;
    		const { destroy } = group(listKey, ul, isSelectable, isMultiselect, indexesSelected);

    		return () => {
    			destroy();
    		};
    	});

    	const writable_props = ['selectable', 'multiselect', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	function ul_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ul = $$value;
    			$$invalidate(0, ul);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('selectable' in $$props) $$invalidate(3, selectable = $$props.selectable);
    		if ('multiselect' in $$props) $$invalidate(4, multiselect = $$props.multiselect);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		setContext,
    		writable,
    		listKey,
    		group,
    		selectable,
    		multiselect,
    		selected,
    		dispatch,
    		ul,
    		isSelectable,
    		isMultiselect,
    		indexesSelected,
    		$indexesSelected
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectable' in $$props) $$invalidate(3, selectable = $$props.selectable);
    		if ('multiselect' in $$props) $$invalidate(4, multiselect = $$props.multiselect);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('ul' in $$props) $$invalidate(0, ul = $$props.ul);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectable*/ 8) {
    			isSelectable.set(selectable);
    		}

    		if ($$self.$$.dirty & /*multiselect*/ 16) {
    			isMultiselect.set(multiselect);
    		}

    		if ($$self.$$.dirty & /*$indexesSelected, selected*/ 36) {
    			if ($indexesSelected !== selected) {
    				$$invalidate(2, selected = $indexesSelected);
    				dispatch('change', { selected });
    			}
    		}

    		if ($$self.$$.dirty & /*selected*/ 4) {
    			indexesSelected.set(selected);
    		}
    	};

    	return [
    		ul,
    		indexesSelected,
    		selected,
    		selectable,
    		multiselect,
    		$indexesSelected,
    		$$scope,
    		slots,
    		ul_1_binding
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			selectable: 3,
    			multiselect: 4,
    			selected: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get selectable() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiselect() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiselect(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/List/ListItem.svelte generated by Svelte v3.55.0 */
    const file$8 = "node_modules/sozai/src/components/List/ListItem.svelte";
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_subtitle_slot_changes = dirty => ({});
    const get_subtitle_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});

    // (54:4) {#if icon}
    function create_if_block$5(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				color: /*selected*/ ctx[0]
    				? /*actualColor*/ ctx[2]
    				: 'var(--secondary-color)',
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};

    			if (dirty & /*selected, actualColor*/ 5) icon_1_changes.color = /*selected*/ ctx[0]
    			? /*actualColor*/ ctx[2]
    			: 'var(--secondary-color)';

    			if (dirty & /*$$scope, icon*/ 2050) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(54:4) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (55:6) <Icon color={selected ? actualColor : 'var(--secondary-color)'}         >
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*icon*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 2) set_data_dev(t, /*icon*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(55:6) <Icon color={selected ? actualColor : 'var(--secondary-color)'}         >",
    		ctx
    	});

    	return block;
    }

    // (53:23)      
    function fallback_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*icon*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*icon*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(53:23)      ",
    		ctx
    	});

    	return block;
    }

    // (60:8)      
    function fallback_block(ctx) {
    	let div;
    	let t;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[9].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[11], get_title_slot_context);
    	const subtitle_slot_template = /*#slots*/ ctx[9].subtitle;
    	const subtitle_slot = create_slot(subtitle_slot_template, ctx, /*$$scope*/ ctx[11], get_subtitle_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_slot) title_slot.c();
    			t = space();
    			if (subtitle_slot) subtitle_slot.c();
    			attr_dev(div, "class", "content svelte-veyjkm");
    			add_location(div, file$8, 60, 4, 1491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			append_dev(div, t);

    			if (subtitle_slot) {
    				subtitle_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[11], dirty, get_title_slot_changes),
    						get_title_slot_context
    					);
    				}
    			}

    			if (subtitle_slot) {
    				if (subtitle_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						subtitle_slot,
    						subtitle_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(subtitle_slot_template, /*$$scope*/ ctx[11], dirty, get_subtitle_slot_changes),
    						get_subtitle_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(subtitle_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(subtitle_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    			if (subtitle_slot) subtitle_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(60:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let li_1;
    	let t0;
    	let t1;
    	let ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[9].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[11], get_prepend_slot_context);
    	const prepend_slot_or_fallback = prepend_slot || fallback_block_1(ctx);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);
    	const append_slot_template = /*#slots*/ ctx[9].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[11], get_append_slot_context);

    	const block = {
    		c: function create() {
    			li_1 = element("li");
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.c();
    			t0 = space();
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t1 = space();
    			if (append_slot) append_slot.c();
    			attr_dev(li_1, "class", "s-component s-listitem svelte-veyjkm");
    			attr_dev(li_1, "style", /*style_*/ ctx[4]);
    			toggle_class(li_1, "selected", /*selected*/ ctx[0]);
    			add_location(li_1, file$8, 44, 0, 1167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li_1, anchor);

    			if (prepend_slot_or_fallback) {
    				prepend_slot_or_fallback.m(li_1, null);
    			}

    			append_dev(li_1, t0);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(li_1, null);
    			}

    			append_dev(li_1, t1);

    			if (append_slot) {
    				append_slot.m(li_1, null);
    			}

    			/*li_1_binding*/ ctx[10](li_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(ripple_action = ripple.call(null, li_1, { disabled: !/*$selectable*/ ctx[5] })),
    					action_destroyer(/*forwardEvents*/ ctx[7].call(null, li_1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_slot) {
    				if (prepend_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						prepend_slot,
    						prepend_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(prepend_slot_template, /*$$scope*/ ctx[11], dirty, get_prepend_slot_changes),
    						get_prepend_slot_context
    					);
    				}
    			} else {
    				if (prepend_slot_or_fallback && prepend_slot_or_fallback.p && (!current || dirty & /*selected, actualColor, icon*/ 7)) {
    					prepend_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*$$scope*/ 2048)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						append_slot,
    						append_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(append_slot_template, /*$$scope*/ ctx[11], dirty, get_append_slot_changes),
    						get_append_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*style_*/ 16) {
    				attr_dev(li_1, "style", /*style_*/ ctx[4]);
    			}

    			if (ripple_action && is_function(ripple_action.update) && dirty & /*$selectable*/ 32) ripple_action.update.call(null, { disabled: !/*$selectable*/ ctx[5] });

    			if (!current || dirty & /*selected*/ 1) {
    				toggle_class(li_1, "selected", /*selected*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot_or_fallback, local);
    			transition_in(default_slot_or_fallback, local);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot_or_fallback, local);
    			transition_out(default_slot_or_fallback, local);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li_1);
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.d(detaching);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			/*li_1_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let actualColor;
    	let style_;
    	let $selectable;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListItem', slots, ['prepend','title','subtitle','default','append']);
    	let { color = 'primary' } = $$props;
    	let { icon = '' } = $$props;
    	let { selected = false } = $$props;

    	/** @type {HTMLElement | undefined}*/
    	let li;

    	const defaultStores = { selectable: writable(false) };

    	const { selectable } = {
    		...defaultStores,
    		.../** @type {typeof defaultStores} */ getContext(listKey)
    	};

    	validate_store(selectable, 'selectable');
    	component_subscribe($$self, selectable, value => $$invalidate(5, $selectable = value));
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	onMount(() => {
    		if (!li) return;
    		const { destroy, selected: ss } = groupItem(listKey, li);
    		const sSub = ss.subscribe(s => $$invalidate(0, selected = s));

    		return () => {
    			sSub();
    			destroy();
    		};
    	});

    	const writable_props = ['color', 'icon', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	function li_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			li = $$value;
    			$$invalidate(3, li);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(8, color = $$props.color);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		get_current_component,
    		onMount,
    		writable,
    		listKey,
    		forwardEventsBuilder,
    		ripple,
    		getColor,
    		Icon,
    		groupItem,
    		color,
    		icon,
    		selected,
    		li,
    		defaultStores,
    		selectable,
    		forwardEvents,
    		actualColor,
    		style_,
    		$selectable
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(8, color = $$props.color);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('li' in $$props) $$invalidate(3, li = $$props.li);
    		if ('actualColor' in $$props) $$invalidate(2, actualColor = $$props.actualColor);
    		if ('style_' in $$props) $$invalidate(4, style_ = $$props.style_);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 256) {
    			$$invalidate(2, actualColor = getColor(color));
    		}

    		if ($$self.$$.dirty & /*actualColor*/ 4) {
    			$$invalidate(4, style_ = `--color: ${actualColor};`);
    		}
    	};

    	return [
    		selected,
    		icon,
    		actualColor,
    		li,
    		style_,
    		$selectable,
    		selectable,
    		forwardEvents,
    		color,
    		slots,
    		li_1_binding,
    		$$scope
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, { color: 8, icon: 1, selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get color() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/Slider/Slider.svelte generated by Svelte v3.55.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "node_modules/sozai/src/components/Slider/Slider.svelte";

    function create_fragment$7(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			input = element("input");
    			attr_dev(div0, "class", "thumb-shadow svelte-1s09o04");
    			toggle_class(div0, "hover", /*thumbHovered*/ ctx[4]);
    			toggle_class(div0, "clicked", /*thumbHovered*/ ctx[4] && /*mouseIsDown*/ ctx[5]);
    			add_location(div0, file$7, 58, 4, 1614);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", /*min*/ ctx[1]);
    			attr_dev(input, "max", /*max*/ ctx[2]);
    			attr_dev(input, "step", /*step*/ ctx[3]);
    			attr_dev(input, "tabindex", "0");
    			attr_dev(input, "class", "svelte-1s09o04");
    			add_location(input, file$7, 64, 4, 1772);
    			attr_dev(div1, "class", "slider-container svelte-1s09o04");
    			add_location(div1, file$7, 57, 2, 1579);
    			attr_dev(div2, "class", "s-component s-slider svelte-1s09o04");
    			attr_dev(div2, "style", /*style*/ ctx[7]);
    			toggle_class(div2, "chrome", navigator.userAgent.includes('Chrome'));
    			add_location(div2, file$7, 52, 0, 1473);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[14](div0);
    			append_dev(div1, t);
    			append_dev(div1, input);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousemove", /*handleMouseMove*/ ctx[8], false, false, false),
    					listen_dev(window, "mousedown", /*mousedown_handler*/ ctx[11], false, false, false),
    					listen_dev(window, "touchstart", /*handleTouchStart*/ ctx[9], false, false, false),
    					listen_dev(window, "mouseup", /*mouseup_handler*/ ctx[12], false, false, false),
    					listen_dev(window, "touchend", /*touchend_handler*/ ctx[13], false, false, false),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[15]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*thumbHovered*/ 16) {
    				toggle_class(div0, "hover", /*thumbHovered*/ ctx[4]);
    			}

    			if (dirty & /*thumbHovered, mouseIsDown*/ 48) {
    				toggle_class(div0, "clicked", /*thumbHovered*/ ctx[4] && /*mouseIsDown*/ ctx[5]);
    			}

    			if (dirty & /*min*/ 2) {
    				attr_dev(input, "min", /*min*/ ctx[1]);
    			}

    			if (dirty & /*max*/ 4) {
    				attr_dev(input, "max", /*max*/ ctx[2]);
    			}

    			if (dirty & /*step*/ 8) {
    				attr_dev(input, "step", /*step*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*style*/ 128) {
    				attr_dev(div2, "style", /*style*/ ctx[7]);
    			}

    			if (dirty & /*navigator*/ 0) {
    				toggle_class(div2, "chrome", navigator.userAgent.includes('Chrome'));
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*div0_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    console.warn('Slider is not finished yet');

    function instance$7($$self, $$props, $$invalidate) {
    	let filledPercent;
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { step = 1e-5 } = $$props;
    	let { value = 50 } = $$props;
    	let thumbHovered = false;
    	let mouseIsDown = false;

    	/** @type {HTMLElement | undefined}*/
    	let thumbShadowEl;

    	/** @type {(x: number, y: number) => void}*/
    	const updateThumbHovered = (x, y) => {
    		if (!thumbShadowEl) return;
    		const boundingRect = thumbShadowEl.getBoundingClientRect();
    		$$invalidate(4, thumbHovered = x >= boundingRect.left && x <= boundingRect.right && y >= boundingRect.top && y <= boundingRect.bottom);
    	};

    	/** @type {(e: MouseEvent) => void}*/
    	const handleMouseMove = e => {
    		if (!thumbShadowEl || mouseIsDown) return;
    		updateThumbHovered(e.clientX, e.clientY);
    	};

    	/** @type {(e: TouchEvent) => void}*/
    	const handleTouchStart = e => {
    		if (!thumbShadowEl || mouseIsDown || e.touches[0] === undefined) return;
    		$$invalidate(5, mouseIsDown = true);
    		updateThumbHovered(e.touches[0].clientX, e.touches[0].clientY);
    	};

    	const writable_props = ['min', 'max', 'step', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = () => $$invalidate(5, mouseIsDown = true);
    	const mouseup_handler = () => $$invalidate(5, mouseIsDown = false);
    	const touchend_handler = () => $$invalidate(5, mouseIsDown = false);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			thumbShadowEl = $$value;
    			$$invalidate(6, thumbShadowEl);
    		});
    	}

    	function input_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('min' in $$props) $$invalidate(1, min = $$props.min);
    		if ('max' in $$props) $$invalidate(2, max = $$props.max);
    		if ('step' in $$props) $$invalidate(3, step = $$props.step);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		min,
    		max,
    		step,
    		value,
    		thumbHovered,
    		mouseIsDown,
    		thumbShadowEl,
    		updateThumbHovered,
    		handleMouseMove,
    		handleTouchStart,
    		filledPercent,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('min' in $$props) $$invalidate(1, min = $$props.min);
    		if ('max' in $$props) $$invalidate(2, max = $$props.max);
    		if ('step' in $$props) $$invalidate(3, step = $$props.step);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('thumbHovered' in $$props) $$invalidate(4, thumbHovered = $$props.thumbHovered);
    		if ('mouseIsDown' in $$props) $$invalidate(5, mouseIsDown = $$props.mouseIsDown);
    		if ('thumbShadowEl' in $$props) $$invalidate(6, thumbShadowEl = $$props.thumbShadowEl);
    		if ('filledPercent' in $$props) $$invalidate(10, filledPercent = $$props.filledPercent);
    		if ('style' in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, min, max*/ 7) {
    			$$invalidate(10, filledPercent = (value - min) / (max - min));
    		}

    		if ($$self.$$.dirty & /*filledPercent*/ 1024) {
    			$$invalidate(7, style = `--movable-dist: calc(100% - 0.75rem); --thumb-dist: calc(0.75rem + ${filledPercent} * var(--movable-dist));`);
    		}
    	};

    	return [
    		value,
    		min,
    		max,
    		step,
    		thumbHovered,
    		mouseIsDown,
    		thumbShadowEl,
    		style,
    		handleMouseMove,
    		handleTouchStart,
    		filledPercent,
    		mousedown_handler,
    		mouseup_handler,
    		touchend_handler,
    		div0_binding,
    		input_change_input_handler
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal, { min: 1, max: 2, step: 3, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/Progress/ProgressCircular.svelte generated by Svelte v3.55.0 */
    const file$6 = "node_modules/sozai/src/components/Progress/ProgressCircular.svelte";

    // (17:0) {#if indeterminate}
    function create_if_block$4(ctx) {
    	let div;
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", /*center*/ ctx[4]);
    			attr_dev(circle, "cy", /*center*/ ctx[4]);
    			attr_dev(circle, "r", /*radius*/ ctx[1]);
    			attr_dev(circle, "fill", "transparent");
    			attr_dev(circle, "stroke-width", /*thickness*/ ctx[2]);
    			attr_dev(circle, "class", "svelte-1pwu2zi");
    			add_location(circle, file$6, 19, 6, 574);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*width*/ ctx[5]);
    			attr_dev(svg, "height", /*width*/ ctx[5]);
    			attr_dev(svg, "class", "svelte-1pwu2zi");
    			add_location(svg, file$6, 18, 4, 504);
    			attr_dev(div, "class", "s-progressloader-circular svelte-1pwu2zi");
    			attr_dev(div, "style", /*style*/ ctx[3]);
    			add_location(div, file$6, 17, 2, 452);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*center*/ 16) {
    				attr_dev(circle, "cx", /*center*/ ctx[4]);
    			}

    			if (dirty & /*center*/ 16) {
    				attr_dev(circle, "cy", /*center*/ ctx[4]);
    			}

    			if (dirty & /*radius*/ 2) {
    				attr_dev(circle, "r", /*radius*/ ctx[1]);
    			}

    			if (dirty & /*thickness*/ 4) {
    				attr_dev(circle, "stroke-width", /*thickness*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 32) {
    				attr_dev(svg, "width", /*width*/ ctx[5]);
    			}

    			if (dirty & /*width*/ 32) {
    				attr_dev(svg, "height", /*width*/ ctx[5]);
    			}

    			if (dirty & /*style*/ 8) {
    				attr_dev(div, "style", /*style*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(17:0) {#if indeterminate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*indeterminate*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*indeterminate*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let width;
    	let center;
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressCircular', slots, []);
    	let { indeterminate = false } = $$props;
    	let { radius = 20 } = $$props;
    	let { thickness = 5.7 } = $$props;
    	let { color = 'var(--primary-color)' } = $$props;
    	const writable_props = ['indeterminate', 'radius', 'thickness', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressCircular> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('indeterminate' in $$props) $$invalidate(0, indeterminate = $$props.indeterminate);
    		if ('radius' in $$props) $$invalidate(1, radius = $$props.radius);
    		if ('thickness' in $$props) $$invalidate(2, thickness = $$props.thickness);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getColor,
    		indeterminate,
    		radius,
    		thickness,
    		color,
    		style,
    		center,
    		width
    	});

    	$$self.$inject_state = $$props => {
    		if ('indeterminate' in $$props) $$invalidate(0, indeterminate = $$props.indeterminate);
    		if ('radius' in $$props) $$invalidate(1, radius = $$props.radius);
    		if ('thickness' in $$props) $$invalidate(2, thickness = $$props.thickness);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    		if ('center' in $$props) $$invalidate(4, center = $$props.center);
    		if ('width' in $$props) $$invalidate(5, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*radius, thickness*/ 6) {
    			$$invalidate(5, width = (radius + thickness) * 2 + 2);
    		}

    		if ($$self.$$.dirty & /*radius, thickness*/ 6) {
    			$$invalidate(4, center = radius + thickness + 1);
    		}

    		if ($$self.$$.dirty & /*color, radius*/ 66) {
    			$$invalidate(3, style = `--color: ${getColor(color)}; --circumference: ${2 * Math.PI * radius}px;`);
    		}
    	};

    	return [indeterminate, radius, thickness, style, center, width, color];
    }

    class ProgressCircular extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			indeterminate: 0,
    			radius: 1,
    			thickness: 2,
    			color: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressCircular",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get indeterminate() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thickness() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thickness(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const parseNumber = parseFloat;

    function joinCss(obj, separator = ';') {
      let texts;
      if (Array.isArray(obj)) {
        texts = obj.filter((text) => text);
      } else {
        texts = [];
        for (const prop in obj) {
          if (obj[prop]) {
            texts.push(`${prop}:${obj[prop]}`);
          }
        }
      }
      return texts.join(separator);
    }

    function getStyles(style, size, pull, fw) {
      let float;
      let width;
      const height = '1em';
      let lineHeight;
      let fontSize;
      let textAlign;
      let verticalAlign = '-.125em';
      const overflow = 'visible';

      if (fw) {
        textAlign = 'center';
        width = '1.25em';
      }

      if (pull) {
        float = pull;
      }

      if (size) {
        if (size == 'lg') {
          fontSize = '1.33333em';
          lineHeight = '.75em';
          verticalAlign = '-.225em';
        } else if (size == 'xs') {
          fontSize = '.75em';
        } else if (size == 'sm') {
          fontSize = '.875em';
        } else {
          fontSize = size.replace('x', 'em');
        }
      }

      return joinCss([
        joinCss({
          float,
          width,
          height,
          'line-height': lineHeight,
          'font-size': fontSize,
          'text-align': textAlign,
          'vertical-align': verticalAlign,
          'transform-origin': 'center',
          overflow,
        }),
        style,
      ]);
    }

    function getTransform(
      scale,
      translateX,
      translateY,
      rotate,
      flip,
      translateTimes = 1,
      translateUnit = '',
      rotateUnit = '',
    ) {
      let flipX = 1;
      let flipY = 1;

      if (flip) {
        if (flip == 'horizontal') {
          flipX = -1;
        } else if (flip == 'vertical') {
          flipY = -1;
        } else {
          flipX = flipY = -1;
        }
      }

      return joinCss(
        [
          `translate(${parseNumber(translateX) * translateTimes}${translateUnit},${parseNumber(translateY) * translateTimes}${translateUnit})`,
          `scale(${flipX * parseNumber(scale)},${flipY * parseNumber(scale)})`,
          rotate && `rotate(${rotate}${rotateUnit})`,
        ],
        ' ',
      );
    }

    /* node_modules/svelte-fa/src/fa.svelte generated by Svelte v3.55.0 */
    const file$5 = "node_modules/svelte-fa/src/fa.svelte";

    // (66:0) {#if i[4]}
    function create_if_block$3(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let g1_transform_value;
    	let g1_transform_origin_value;
    	let svg_id_value;
    	let svg_class_value;
    	let svg_viewBox_value;

    	function select_block_type(ctx, dirty) {
    		if (typeof /*i*/ ctx[10][4] == 'string') return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			if_block.c();
    			attr_dev(g0, "transform", /*transform*/ ctx[12]);
    			add_location(g0, file$5, 81, 6, 1397);
    			attr_dev(g1, "transform", g1_transform_value = "translate(" + /*i*/ ctx[10][0] / 2 + " " + /*i*/ ctx[10][1] / 2 + ")");
    			attr_dev(g1, "transform-origin", g1_transform_origin_value = "" + (/*i*/ ctx[10][0] / 4 + " 0"));
    			add_location(g1, file$5, 77, 4, 1293);
    			attr_dev(svg, "id", svg_id_value = /*id*/ ctx[1] || undefined);
    			attr_dev(svg, "class", svg_class_value = "svelte-fa " + /*clazz*/ ctx[0] + " svelte-1cj2gr0");
    			attr_dev(svg, "style", /*s*/ ctx[11]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*i*/ ctx[10][0] + " " + /*i*/ ctx[10][1]);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			toggle_class(svg, "pulse", /*pulse*/ ctx[4]);
    			toggle_class(svg, "spin", /*spin*/ ctx[3]);
    			add_location(svg, file$5, 66, 2, 1071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			if_block.m(g0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g0, null);
    				}
    			}

    			if (dirty & /*transform*/ 4096) {
    				attr_dev(g0, "transform", /*transform*/ ctx[12]);
    			}

    			if (dirty & /*i*/ 1024 && g1_transform_value !== (g1_transform_value = "translate(" + /*i*/ ctx[10][0] / 2 + " " + /*i*/ ctx[10][1] / 2 + ")")) {
    				attr_dev(g1, "transform", g1_transform_value);
    			}

    			if (dirty & /*i*/ 1024 && g1_transform_origin_value !== (g1_transform_origin_value = "" + (/*i*/ ctx[10][0] / 4 + " 0"))) {
    				attr_dev(g1, "transform-origin", g1_transform_origin_value);
    			}

    			if (dirty & /*id*/ 2 && svg_id_value !== (svg_id_value = /*id*/ ctx[1] || undefined)) {
    				attr_dev(svg, "id", svg_id_value);
    			}

    			if (dirty & /*clazz*/ 1 && svg_class_value !== (svg_class_value = "svelte-fa " + /*clazz*/ ctx[0] + " svelte-1cj2gr0")) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*s*/ 2048) {
    				attr_dev(svg, "style", /*s*/ ctx[11]);
    			}

    			if (dirty & /*i*/ 1024 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*i*/ ctx[10][0] + " " + /*i*/ ctx[10][1])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*clazz, pulse*/ 17) {
    				toggle_class(svg, "pulse", /*pulse*/ ctx[4]);
    			}

    			if (dirty & /*clazz, spin*/ 9) {
    				toggle_class(svg, "spin", /*spin*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(66:0) {#if i[4]}",
    		ctx
    	});

    	return block;
    }

    // (89:8) {:else}
    function create_else_block$2(ctx) {
    	let path0;
    	let path0_d_value;
    	let path0_fill_value;
    	let path0_fill_opacity_value;
    	let path0_transform_value;
    	let path1;
    	let path1_d_value;
    	let path1_fill_value;
    	let path1_fill_opacity_value;
    	let path1_transform_value;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", path0_d_value = /*i*/ ctx[10][4][0]);
    			attr_dev(path0, "fill", path0_fill_value = /*secondaryColor*/ ctx[6] || /*color*/ ctx[2] || 'currentColor');

    			attr_dev(path0, "fill-opacity", path0_fill_opacity_value = /*swapOpacity*/ ctx[9] != false
    			? /*primaryOpacity*/ ctx[7]
    			: /*secondaryOpacity*/ ctx[8]);

    			attr_dev(path0, "transform", path0_transform_value = "translate(" + /*i*/ ctx[10][0] / -2 + " " + /*i*/ ctx[10][1] / -2 + ")");
    			add_location(path0, file$5, 90, 10, 1678);
    			attr_dev(path1, "d", path1_d_value = /*i*/ ctx[10][4][1]);
    			attr_dev(path1, "fill", path1_fill_value = /*primaryColor*/ ctx[5] || /*color*/ ctx[2] || 'currentColor');

    			attr_dev(path1, "fill-opacity", path1_fill_opacity_value = /*swapOpacity*/ ctx[9] != false
    			? /*secondaryOpacity*/ ctx[8]
    			: /*primaryOpacity*/ ctx[7]);

    			attr_dev(path1, "transform", path1_transform_value = "translate(" + /*i*/ ctx[10][0] / -2 + " " + /*i*/ ctx[10][1] / -2 + ")");
    			add_location(path1, file$5, 96, 10, 1935);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 1024 && path0_d_value !== (path0_d_value = /*i*/ ctx[10][4][0])) {
    				attr_dev(path0, "d", path0_d_value);
    			}

    			if (dirty & /*secondaryColor, color*/ 68 && path0_fill_value !== (path0_fill_value = /*secondaryColor*/ ctx[6] || /*color*/ ctx[2] || 'currentColor')) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*swapOpacity, primaryOpacity, secondaryOpacity*/ 896 && path0_fill_opacity_value !== (path0_fill_opacity_value = /*swapOpacity*/ ctx[9] != false
    			? /*primaryOpacity*/ ctx[7]
    			: /*secondaryOpacity*/ ctx[8])) {
    				attr_dev(path0, "fill-opacity", path0_fill_opacity_value);
    			}

    			if (dirty & /*i*/ 1024 && path0_transform_value !== (path0_transform_value = "translate(" + /*i*/ ctx[10][0] / -2 + " " + /*i*/ ctx[10][1] / -2 + ")")) {
    				attr_dev(path0, "transform", path0_transform_value);
    			}

    			if (dirty & /*i*/ 1024 && path1_d_value !== (path1_d_value = /*i*/ ctx[10][4][1])) {
    				attr_dev(path1, "d", path1_d_value);
    			}

    			if (dirty & /*primaryColor, color*/ 36 && path1_fill_value !== (path1_fill_value = /*primaryColor*/ ctx[5] || /*color*/ ctx[2] || 'currentColor')) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*swapOpacity, secondaryOpacity, primaryOpacity*/ 896 && path1_fill_opacity_value !== (path1_fill_opacity_value = /*swapOpacity*/ ctx[9] != false
    			? /*secondaryOpacity*/ ctx[8]
    			: /*primaryOpacity*/ ctx[7])) {
    				attr_dev(path1, "fill-opacity", path1_fill_opacity_value);
    			}

    			if (dirty & /*i*/ 1024 && path1_transform_value !== (path1_transform_value = "translate(" + /*i*/ ctx[10][0] / -2 + " " + /*i*/ ctx[10][1] / -2 + ")")) {
    				attr_dev(path1, "transform", path1_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(89:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (83:8) {#if typeof i[4] == 'string'}
    function create_if_block_1$1(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let path_transform_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*i*/ ctx[10][4]);
    			attr_dev(path, "fill", path_fill_value = /*color*/ ctx[2] || /*primaryColor*/ ctx[5] || 'currentColor');
    			attr_dev(path, "transform", path_transform_value = "translate(" + /*i*/ ctx[10][0] / -2 + " " + /*i*/ ctx[10][1] / -2 + ")");
    			add_location(path, file$5, 83, 10, 1461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 1024 && path_d_value !== (path_d_value = /*i*/ ctx[10][4])) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color, primaryColor*/ 36 && path_fill_value !== (path_fill_value = /*color*/ ctx[2] || /*primaryColor*/ ctx[5] || 'currentColor')) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*i*/ 1024 && path_transform_value !== (path_transform_value = "translate(" + /*i*/ ctx[10][0] / -2 + " " + /*i*/ ctx[10][1] / -2 + ")")) {
    				attr_dev(path, "transform", path_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(83:8) {#if typeof i[4] == 'string'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*i*/ ctx[10][4] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*i*/ ctx[10][4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fa', slots, []);
    	let { class: clazz = '' } = $$props;
    	let { id = '' } = $$props;
    	let { style = '' } = $$props;
    	let { icon } = $$props;
    	let { size = '' } = $$props;
    	let { color = '' } = $$props;
    	let { fw = false } = $$props;
    	let { pull = '' } = $$props;
    	let { scale = 1 } = $$props;
    	let { translateX = 0 } = $$props;
    	let { translateY = 0 } = $$props;
    	let { rotate = '' } = $$props;
    	let { flip = false } = $$props;
    	let { spin = false } = $$props;
    	let { pulse = false } = $$props;
    	let { primaryColor = '' } = $$props;
    	let { secondaryColor = '' } = $$props;
    	let { primaryOpacity = 1 } = $$props;
    	let { secondaryOpacity = 0.4 } = $$props;
    	let { swapOpacity = false } = $$props;
    	let i;
    	let s;
    	let transform;

    	$$self.$$.on_mount.push(function () {
    		if (icon === undefined && !('icon' in $$props || $$self.$$.bound[$$self.$$.props['icon']])) {
    			console.warn("<Fa> was created without expected prop 'icon'");
    		}
    	});

    	const writable_props = [
    		'class',
    		'id',
    		'style',
    		'icon',
    		'size',
    		'color',
    		'fw',
    		'pull',
    		'scale',
    		'translateX',
    		'translateY',
    		'rotate',
    		'flip',
    		'spin',
    		'pulse',
    		'primaryColor',
    		'secondaryColor',
    		'primaryOpacity',
    		'secondaryOpacity',
    		'swapOpacity'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fa> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, clazz = $$props.class);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('style' in $$props) $$invalidate(13, style = $$props.style);
    		if ('icon' in $$props) $$invalidate(14, icon = $$props.icon);
    		if ('size' in $$props) $$invalidate(15, size = $$props.size);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('fw' in $$props) $$invalidate(16, fw = $$props.fw);
    		if ('pull' in $$props) $$invalidate(17, pull = $$props.pull);
    		if ('scale' in $$props) $$invalidate(18, scale = $$props.scale);
    		if ('translateX' in $$props) $$invalidate(19, translateX = $$props.translateX);
    		if ('translateY' in $$props) $$invalidate(20, translateY = $$props.translateY);
    		if ('rotate' in $$props) $$invalidate(21, rotate = $$props.rotate);
    		if ('flip' in $$props) $$invalidate(22, flip = $$props.flip);
    		if ('spin' in $$props) $$invalidate(3, spin = $$props.spin);
    		if ('pulse' in $$props) $$invalidate(4, pulse = $$props.pulse);
    		if ('primaryColor' in $$props) $$invalidate(5, primaryColor = $$props.primaryColor);
    		if ('secondaryColor' in $$props) $$invalidate(6, secondaryColor = $$props.secondaryColor);
    		if ('primaryOpacity' in $$props) $$invalidate(7, primaryOpacity = $$props.primaryOpacity);
    		if ('secondaryOpacity' in $$props) $$invalidate(8, secondaryOpacity = $$props.secondaryOpacity);
    		if ('swapOpacity' in $$props) $$invalidate(9, swapOpacity = $$props.swapOpacity);
    	};

    	$$self.$capture_state = () => ({
    		getStyles,
    		getTransform,
    		clazz,
    		id,
    		style,
    		icon,
    		size,
    		color,
    		fw,
    		pull,
    		scale,
    		translateX,
    		translateY,
    		rotate,
    		flip,
    		spin,
    		pulse,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		s,
    		transform
    	});

    	$$self.$inject_state = $$props => {
    		if ('clazz' in $$props) $$invalidate(0, clazz = $$props.clazz);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('style' in $$props) $$invalidate(13, style = $$props.style);
    		if ('icon' in $$props) $$invalidate(14, icon = $$props.icon);
    		if ('size' in $$props) $$invalidate(15, size = $$props.size);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('fw' in $$props) $$invalidate(16, fw = $$props.fw);
    		if ('pull' in $$props) $$invalidate(17, pull = $$props.pull);
    		if ('scale' in $$props) $$invalidate(18, scale = $$props.scale);
    		if ('translateX' in $$props) $$invalidate(19, translateX = $$props.translateX);
    		if ('translateY' in $$props) $$invalidate(20, translateY = $$props.translateY);
    		if ('rotate' in $$props) $$invalidate(21, rotate = $$props.rotate);
    		if ('flip' in $$props) $$invalidate(22, flip = $$props.flip);
    		if ('spin' in $$props) $$invalidate(3, spin = $$props.spin);
    		if ('pulse' in $$props) $$invalidate(4, pulse = $$props.pulse);
    		if ('primaryColor' in $$props) $$invalidate(5, primaryColor = $$props.primaryColor);
    		if ('secondaryColor' in $$props) $$invalidate(6, secondaryColor = $$props.secondaryColor);
    		if ('primaryOpacity' in $$props) $$invalidate(7, primaryOpacity = $$props.primaryOpacity);
    		if ('secondaryOpacity' in $$props) $$invalidate(8, secondaryOpacity = $$props.secondaryOpacity);
    		if ('swapOpacity' in $$props) $$invalidate(9, swapOpacity = $$props.swapOpacity);
    		if ('i' in $$props) $$invalidate(10, i = $$props.i);
    		if ('s' in $$props) $$invalidate(11, s = $$props.s);
    		if ('transform' in $$props) $$invalidate(12, transform = $$props.transform);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16384) {
    			$$invalidate(10, i = icon && icon.icon || [0, 0, '', [], '']);
    		}

    		if ($$self.$$.dirty & /*style, size, pull, fw*/ 237568) {
    			$$invalidate(11, s = getStyles(style, size, pull, fw));
    		}

    		if ($$self.$$.dirty & /*scale, translateX, translateY, rotate, flip*/ 8126464) {
    			$$invalidate(12, transform = getTransform(scale, translateX, translateY, rotate, flip, 512));
    		}
    	};

    	return [
    		clazz,
    		id,
    		color,
    		spin,
    		pulse,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		s,
    		transform,
    		style,
    		icon,
    		size,
    		fw,
    		pull,
    		scale,
    		translateX,
    		translateY,
    		rotate,
    		flip
    	];
    }

    class Fa extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			class: 0,
    			id: 1,
    			style: 13,
    			icon: 14,
    			size: 15,
    			color: 2,
    			fw: 16,
    			pull: 17,
    			scale: 18,
    			translateX: 19,
    			translateY: 20,
    			rotate: 21,
    			flip: 22,
    			spin: 3,
    			pulse: 4,
    			primaryColor: 5,
    			secondaryColor: 6,
    			primaryOpacity: 7,
    			secondaryOpacity: 8,
    			swapOpacity: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fa",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fw() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fw(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pull() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pull(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get translateX() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateX(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get translateY() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateY(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pulse() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pulse(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get swapOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set swapOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var faX = {
      prefix: 'fas',
      iconName: 'x',
      icon: [384, 512, [120], "58", "M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"]
    };

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    /* src/OnOpen.svelte generated by Svelte v3.55.0 */

    const { console: console_1$2 } = globals;
    const file$4 = "src/OnOpen.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (74:4) {#if Array.from(bannedWords).length > 0}
    function create_if_block$2(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Excluded Words In The WordCloud";
    			attr_dev(h3, "id", "banned-word-banner");
    			attr_dev(h3, "class", "svelte-134ebij");
    			add_location(h3, file$4, 73, 44, 2119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(74:4) {#if Array.from(bannedWords).length > 0}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {#each Array.from(bannedWords) as word, i}
    function create_each_block(ctx) {
    	let div;
    	let h5;
    	let t0_value = /*i*/ ctx[19] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*word*/ ctx[17] + "";
    	let t2;
    	let t3;
    	let button;
    	let fa;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	fa = new Fa({ props: { icon: faX }, $$inline: true });

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*i*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = text(". ");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			create_component(fa.$$.fragment);
    			t4 = space();
    			set_style(h5, "font-size", "1.5em");
    			add_location(h5, file$4, 80, 10, 2365);
    			add_location(button, file$4, 81, 10, 2426);
    			attr_dev(div, "class", "excluded-word-item svelte-134ebij");
    			add_location(div, file$4, 79, 8, 2322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    			append_dev(div, t3);
    			append_dev(div, button);
    			mount_component(fa, button, null);
    			append_dev(div, t4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*bannedWords*/ 16) && t2_value !== (t2_value = /*word*/ ctx[17] + "")) set_data_dev(t2, t2_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fa);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(79:6) {#each Array.from(bannedWords) as word, i}",
    		ctx
    	});

    	return block;
    }

    // (73:2) <List>
    function create_default_slot_3(ctx) {
    	let show_if = Array.from(/*bannedWords*/ ctx[4]).length > 0;
    	let t;
    	let div;
    	let current;
    	let if_block = show_if && create_if_block$2(ctx);
    	let each_value = Array.from(/*bannedWords*/ ctx[4]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div, "margin-top", "1em");
    			set_style(div, "margin-bottom", "1em");
    			add_location(div, file$4, 77, 4, 2214);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bannedWords*/ 16) show_if = Array.from(/*bannedWords*/ ctx[4]).length > 0;

    			if (show_if) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*Array, bannedWords, faX*/ 16) {
    				each_value = Array.from(/*bannedWords*/ ctx[4]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(73:2) <List>",
    		ctx
    	});

    	return block;
    }

    // (105:6) <Button         disabled={binput?.length == 0 || bannedWords.has(binput)}         on:click={() => {           bannedWords.add(binput);           bannedWords = bannedWords;           binput = "";         }}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add Word!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(105:6) <Button         disabled={binput?.length == 0 || bannedWords.has(binput)}         on:click={() => {           bannedWords.add(binput);           bannedWords = bannedWords;           binput = \\\"\\\";         }}>",
    		ctx
    	});

    	return block;
    }

    // (128:2) <Button disabled={buttonDisabled} type="submit" on:click={submitForm} style="width: 100%; text-align: center; width: 30em;"     >
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Get Analysis!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(128:2) <Button disabled={buttonDisabled} type=\\\"submit\\\" on:click={submitForm} style=\\\"width: 100%; text-align: center; width: 30em;\\\"     >",
    		ctx
    	});

    	return block;
    }

    // (50:0) <SozaiApp>
    function create_default_slot$2(ctx) {
    	let h2;
    	let t1;
    	let p0;
    	let t2;
    	let a;
    	let t4;
    	let br0;
    	let t5;
    	let br1;
    	let t6;
    	let t7;
    	let input;
    	let t8;
    	let div0;
    	let textfield0;
    	let updating_value;
    	let t9;
    	let h40;
    	let t11;
    	let p1;
    	let t13;
    	let list;
    	let t14;
    	let div3;
    	let div1;
    	let textfield1;
    	let updating_value_1;
    	let t15;
    	let div2;
    	let button0;
    	let t16;
    	let h41;
    	let t18;
    	let p2;
    	let t20;
    	let div4;
    	let textfield2;
    	let updating_value_2;
    	let t21;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[10](value);
    	}

    	let textfield0_props = { label: "Name of Channel", outlined: true };

    	if (/*channelName*/ ctx[0] !== void 0) {
    		textfield0_props.value = /*channelName*/ ctx[0];
    	}

    	textfield0 = new TextField({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield0, 'value', textfield0_value_binding, /*channelName*/ ctx[0]));

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[12](value);
    	}

    	let textfield1_props = { label: "Enter Word", outlined: true };

    	if (/*binput*/ ctx[5] !== void 0) {
    		textfield1_props.value = /*binput*/ ctx[5];
    	}

    	textfield1 = new TextField({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield1, 'value', textfield1_value_binding, /*binput*/ ctx[5]));

    	button0 = new Button({
    			props: {
    				disabled: /*binput*/ ctx[5]?.length == 0 || /*bannedWords*/ ctx[4].has(/*binput*/ ctx[5]),
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler_1*/ ctx[13]);

    	function textfield2_value_binding(value) {
    		/*textfield2_value_binding*/ ctx[14](value);
    	}

    	let textfield2_props = {
    		outlined: true,
    		label: "Smoothing Parameter (Messages Averaged)",
    		error: isNaN(/*messagesAveraging*/ ctx[2]) || parseInt(/*messagesAveraging*/ ctx[2]) <= 1
    		? "Must be a number greater than 1."
    		: null
    	};

    	if (/*messagesAveraging*/ ctx[2] !== void 0) {
    		textfield2_props.value = /*messagesAveraging*/ ctx[2];
    	}

    	textfield2 = new TextField({ props: textfield2_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield2, 'value', textfield2_value_binding, /*messagesAveraging*/ ctx[2]));

    	button1 = new Button({
    			props: {
    				disabled: /*buttonDisabled*/ ctx[3],
    				type: "submit",
    				style: "width: 100%; text-align: center; width: 30em;",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*submitForm*/ ctx[7]);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Discord Channel Analyzer!";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Just upload a .txt file of the Discord Channel [");
    			a = element("a");
    			a.textContent = "instructions";
    			t4 = text("]!  ");
    			br0 = element("br");
    			t5 = space();
    			br1 = element("br");
    			t6 = text(" \n      You will receive a wordcloud summmarizing some of the most used words and a graph of the sentiment over time.");
    			t7 = space();
    			input = element("input");
    			t8 = space();
    			div0 = element("div");
    			create_component(textfield0.$$.fragment);
    			t9 = space();
    			h40 = element("h4");
    			h40.textContent = "WordCloud Parameters";
    			t11 = space();
    			p1 = element("p");
    			p1.textContent = "Enter words below to exclude from the WordCloud.";
    			t13 = space();
    			create_component(list.$$.fragment);
    			t14 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(textfield1.$$.fragment);
    			t15 = space();
    			div2 = element("div");
    			create_component(button0.$$.fragment);
    			t16 = space();
    			h41 = element("h4");
    			h41.textContent = "Sentiment Analysis Parameters";
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "Enter how many messages to average when computing data points for the sentiment graph.";
    			t20 = space();
    			div4 = element("div");
    			create_component(textfield2.$$.fragment);
    			t21 = space();
    			create_component(button1.$$.fragment);
    			add_location(h2, file$4, 50, 2, 1271);
    			attr_dev(a, "href", "https://www.youtube.com/watch?v=tt-TBOWLyJk");
    			add_location(a, file$4, 51, 80, 1386);
    			add_location(br0, file$4, 51, 155, 1461);
    			add_location(br1, file$4, 51, 160, 1466);
    			set_style(p0, "font-size", "1.2em");
    			add_location(p0, file$4, 51, 2, 1308);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "id", "upload-input");
    			attr_dev(input, "accept", "txt text/plain");
    			add_location(input, file$4, 55, 2, 1600);
    			attr_dev(div0, "id", "channel-name-tf");
    			attr_dev(div0, "class", "svelte-134ebij");
    			add_location(div0, file$4, 63, 2, 1732);
    			set_style(h40, "margin-top", "0.6em");
    			add_location(h40, file$4, 69, 2, 1926);
    			set_style(p1, "font-size", "1em");
    			add_location(p1, file$4, 70, 2, 1984);
    			attr_dev(div1, "class", "banned-words-tf svelte-134ebij");
    			add_location(div1, file$4, 96, 4, 2776);
    			attr_dev(div2, "class", "button-add svelte-134ebij");
    			add_location(div2, file$4, 103, 4, 2920);
    			attr_dev(div3, "class", "banned-word-row svelte-134ebij");
    			add_location(div3, file$4, 95, 2, 2742);
    			set_style(h41, "margin-top", "0.6em");
    			add_location(h41, file$4, 115, 2, 3207);
    			set_style(p2, "font-size", "1em");
    			add_location(p2, file$4, 116, 2, 3275);
    			attr_dev(div4, "id", "sentiment-parameters");
    			attr_dev(div4, "class", "svelte-134ebij");
    			add_location(div4, file$4, 118, 2, 3397);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, a);
    			append_dev(p0, t4);
    			append_dev(p0, br0);
    			append_dev(p0, t5);
    			append_dev(p0, br1);
    			append_dev(p0, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[9](input);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(textfield0, div0, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(list, target, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			mount_component(textfield1, div1, null);
    			append_dev(div3, t15);
    			append_dev(div3, div2);
    			mount_component(button0, div2, null);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(textfield2, div4, null);
    			insert_dev(target, t21, anchor);
    			mount_component(button1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*setTxt*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const textfield0_changes = {};

    			if (!updating_value && dirty & /*channelName*/ 1) {
    				updating_value = true;
    				textfield0_changes.value = /*channelName*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const list_changes = {};

    			if (dirty & /*$$scope, bannedWords*/ 1048592) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*binput*/ 32) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*binput*/ ctx[5];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    			const button0_changes = {};
    			if (dirty & /*binput, bannedWords*/ 48) button0_changes.disabled = /*binput*/ ctx[5]?.length == 0 || /*bannedWords*/ ctx[4].has(/*binput*/ ctx[5]);

    			if (dirty & /*$$scope*/ 1048576) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const textfield2_changes = {};

    			if (dirty & /*messagesAveraging*/ 4) textfield2_changes.error = isNaN(/*messagesAveraging*/ ctx[2]) || parseInt(/*messagesAveraging*/ ctx[2]) <= 1
    			? "Must be a number greater than 1."
    			: null;

    			if (!updating_value_2 && dirty & /*messagesAveraging*/ 4) {
    				updating_value_2 = true;
    				textfield2_changes.value = /*messagesAveraging*/ ctx[2];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			textfield2.$set(textfield2_changes);
    			const button1_changes = {};
    			if (dirty & /*buttonDisabled*/ 8) button1_changes.disabled = /*buttonDisabled*/ ctx[3];

    			if (dirty & /*$$scope*/ 1048576) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(list.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(textfield2.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(list.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[9](null);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div0);
    			destroy_component(textfield0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t13);
    			destroy_component(list, detaching);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div3);
    			destroy_component(textfield1);
    			destroy_component(button0);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(div4);
    			destroy_component(textfield2);
    			if (detaching) detach_dev(t21);
    			destroy_component(button1, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(50:0) <SozaiApp>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let sozaiapp;
    	let current;

    	sozaiapp = new SozaiApp({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sozaiapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sozaiapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sozaiapp_changes = {};

    			if (dirty & /*$$scope, buttonDisabled, messagesAveraging, binput, bannedWords, channelName, secretInput*/ 1048639) {
    				sozaiapp_changes.$$scope = { dirty, ctx };
    			}

    			sozaiapp.$set(sozaiapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sozaiapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sozaiapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sozaiapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkDisabled(discordJSON, channelName) {
    	return discordJSON == null || channelName?.length == 0;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OnOpen', slots, []);
    	let secretInput;
    	let txtFile;
    	const dispatcher = createEventDispatcher();
    	let discordJSON;
    	let channelName;
    	let messagesAveraging = 100;
    	let buttonDisabled = true;
    	let bannedWords = new Set();
    	let binput;

    	function setTxt(e) {
    		const i = e.target.files[0];
    		txtFile = i;
    		console.log(txtFile);
    		const fr = new FileReader();

    		fr.addEventListener("load", () => {
    			$$invalidate(8, discordJSON = JSON.parse(fr.result));
    		});

    		fr.readAsText(txtFile);
    	}

    	//   const fr = new FileReader();
    	//   const text = fr.readAsText("ML_CLUB_GENERAL.txt");
    	//   console.log(text);
    	function submitForm() {
    		dispatcher("submittedTxt", {
    			discordJSON,
    			bannedWords,
    			messagesAveraging,
    			channelName
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<OnOpen> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			secretInput = $$value;
    			$$invalidate(1, secretInput);
    		});
    	}

    	function textfield0_value_binding(value) {
    		channelName = value;
    		$$invalidate(0, channelName);
    	}

    	const click_handler = i => {
    		const deleteWord = Array.from(bannedWords)[i];
    		bannedWords.delete(deleteWord);
    		$$invalidate(4, bannedWords);
    	};

    	function textfield1_value_binding(value) {
    		binput = value;
    		$$invalidate(5, binput);
    	}

    	const click_handler_1 = () => {
    		bannedWords.add(binput);
    		$$invalidate(4, bannedWords);
    		$$invalidate(5, binput = "");
    	};

    	function textfield2_value_binding(value) {
    		messagesAveraging = value;
    		$$invalidate(2, messagesAveraging);
    	}

    	$$self.$capture_state = () => ({
    		SozaiApp,
    		Button,
    		TextField,
    		List,
    		ListItem,
    		Slider,
    		secretInput,
    		txtFile,
    		createEventDispatcher,
    		Fa,
    		faX,
    		dispatcher,
    		discordJSON,
    		channelName,
    		messagesAveraging,
    		buttonDisabled,
    		bannedWords,
    		checkDisabled,
    		binput,
    		setTxt,
    		submitForm
    	});

    	$$self.$inject_state = $$props => {
    		if ('secretInput' in $$props) $$invalidate(1, secretInput = $$props.secretInput);
    		if ('txtFile' in $$props) txtFile = $$props.txtFile;
    		if ('discordJSON' in $$props) $$invalidate(8, discordJSON = $$props.discordJSON);
    		if ('channelName' in $$props) $$invalidate(0, channelName = $$props.channelName);
    		if ('messagesAveraging' in $$props) $$invalidate(2, messagesAveraging = $$props.messagesAveraging);
    		if ('buttonDisabled' in $$props) $$invalidate(3, buttonDisabled = $$props.buttonDisabled);
    		if ('bannedWords' in $$props) $$invalidate(4, bannedWords = $$props.bannedWords);
    		if ('binput' in $$props) $$invalidate(5, binput = $$props.binput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*discordJSON, channelName*/ 257) {
    			$$invalidate(3, buttonDisabled = checkDisabled(discordJSON, channelName));
    		}
    	};

    	return [
    		channelName,
    		secretInput,
    		messagesAveraging,
    		buttonDisabled,
    		bannedWords,
    		binput,
    		setTxt,
    		submitForm,
    		discordJSON,
    		input_binding,
    		textfield0_value_binding,
    		click_handler,
    		textfield1_value_binding,
    		click_handler_1,
    		textfield2_value_binding
    	];
    }

    class OnOpen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OnOpen",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    /*
     * Export kMaxLength after typed array support is determined.
     */
    kMaxLength();

    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;
      if (typeof Symbol !== 'undefined' && Symbol.species &&
          Buffer[Symbol.species] === Buffer) ;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }
    Buffer.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    /* src/WordCloudDisplay.svelte generated by Svelte v3.55.0 */
    const file$3 = "src/WordCloudDisplay.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let p;
    	let i;
    	let t3;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "WordCloud: Most Common Words";
    			t1 = space();
    			p = element("p");
    			i = element("i");
    			i.textContent = "Below shows all of the most common words in the Discord Server channel.\n      Note that the words of no meaning (e.g. \"the\") are excluded along with\n      others.";
    			t3 = space();
    			img = element("img");
    			attr_dev(h4, "id", "title");
    			attr_dev(h4, "class", "svelte-y7ltbj");
    			add_location(h4, file$3, 16, 2, 439);
    			add_location(i, file$3, 18, 4, 525);
    			attr_dev(p, "id", "wordcloud-description");
    			attr_dev(p, "class", "svelte-y7ltbj");
    			add_location(p, file$3, 17, 2, 490);
    			attr_dev(img, "id", "wordcloud-image");
    			if (!src_url_equal(img.src, img_src_value = /*wordCloudSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Wordcloud.");
    			attr_dev(img, "class", "svelte-y7ltbj");
    			add_location(img, file$3, 24, 2, 716);
    			attr_dev(div, "class", "container svelte-y7ltbj");
    			add_location(div, file$3, 15, 0, 413);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, i);
    			append_dev(div, t3);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*wordCloudSrc*/ 1 && !src_url_equal(img.src, img_src_value = /*wordCloudSrc*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WordCloudDisplay', slots, []);
    	let { wordCloudResponse } = $$props;
    	let wordCloudSrc;

    	async function renderImage() {
    		const arrayBuffer = await wordCloudResponse.arrayBuffer();
    		const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    		let base64data = buffer.toString("base64");
    		$$invalidate(0, wordCloudSrc = `data:image/jpeg;base64,${base64data.toString("base64")}`);
    	}

    	renderImage();

    	$$self.$$.on_mount.push(function () {
    		if (wordCloudResponse === undefined && !('wordCloudResponse' in $$props || $$self.$$.bound[$$self.$$.props['wordCloudResponse']])) {
    			console.warn("<WordCloudDisplay> was created without expected prop 'wordCloudResponse'");
    		}
    	});

    	const writable_props = ['wordCloudResponse'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WordCloudDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('wordCloudResponse' in $$props) $$invalidate(1, wordCloudResponse = $$props.wordCloudResponse);
    	};

    	$$self.$capture_state = () => ({
    		wordCloudResponse,
    		Buffer,
    		wordCloudSrc,
    		renderImage
    	});

    	$$self.$inject_state = $$props => {
    		if ('wordCloudResponse' in $$props) $$invalidate(1, wordCloudResponse = $$props.wordCloudResponse);
    		if ('wordCloudSrc' in $$props) $$invalidate(0, wordCloudSrc = $$props.wordCloudSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wordCloudSrc, wordCloudResponse];
    }

    class WordCloudDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, { wordCloudResponse: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WordCloudDisplay",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get wordCloudResponse() {
    		throw new Error("<WordCloudDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wordCloudResponse(value) {
    		throw new Error("<WordCloudDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SentiDisplay.svelte generated by Svelte v3.55.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/SentiDisplay.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let p;
    	let i;
    	let t2;
    	let a;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Sentiment Analysis Positive/Negative Over Time";
    			t1 = space();
    			p = element("p");
    			i = element("i");
    			t2 = text("Below shows the ");
    			a = element("a");
    			a.textContent = "sentiment (positive/negative)";
    			t4 = text("\n      of the channel over time. The dates of the messages are shown on the\n      x-axis and are not spread out evenly (as message frequency is not\n      consistent.) Note that the sentiment is averaged over every ");
    			t5 = text(/*messagesAveraging*/ ctx[0]);
    			t6 = text("\n      messages.");
    			t7 = space();
    			img = element("img");
    			attr_dev(h4, "id", "title");
    			add_location(h4, file$2, 19, 2, 507);
    			attr_dev(a, "href", "https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english");
    			add_location(a, file$2, 22, 22, 633);
    			add_location(i, file$2, 21, 4, 607);
    			attr_dev(p, "id", "senti-description");
    			attr_dev(p, "class", "svelte-i0zey8");
    			add_location(p, file$2, 20, 2, 576);
    			attr_dev(img, "id", "senti-image");
    			if (!src_url_equal(img.src, img_src_value = /*sentiSrc*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Sentiment Analysis Plot.");
    			attr_dev(img, "class", "svelte-i0zey8");
    			add_location(img, file$2, 33, 2, 1046);
    			attr_dev(div, "class", "container svelte-i0zey8");
    			add_location(div, file$2, 18, 0, 481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, i);
    			append_dev(i, t2);
    			append_dev(i, a);
    			append_dev(i, t4);
    			append_dev(i, t5);
    			append_dev(i, t6);
    			append_dev(div, t7);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*messagesAveraging*/ 1) set_data_dev(t5, /*messagesAveraging*/ ctx[0]);

    			if (dirty & /*sentiSrc*/ 2 && !src_url_equal(img.src, img_src_value = /*sentiSrc*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SentiDisplay', slots, []);
    	let { sentimentAnalysisResponse } = $$props;
    	let { messagesAveraging } = $$props;
    	let sentiSrc;

    	async function renderImage() {
    		const arrayBuffer = await sentimentAnalysisResponse.arrayBuffer();
    		const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    		let base64data = buffer.toString("base64");
    		$$invalidate(1, sentiSrc = `data:image/jpeg;base64,${base64data.toString("base64")}`);
    		console.log(sentiSrc);
    	}

    	renderImage();

    	$$self.$$.on_mount.push(function () {
    		if (sentimentAnalysisResponse === undefined && !('sentimentAnalysisResponse' in $$props || $$self.$$.bound[$$self.$$.props['sentimentAnalysisResponse']])) {
    			console_1$1.warn("<SentiDisplay> was created without expected prop 'sentimentAnalysisResponse'");
    		}

    		if (messagesAveraging === undefined && !('messagesAveraging' in $$props || $$self.$$.bound[$$self.$$.props['messagesAveraging']])) {
    			console_1$1.warn("<SentiDisplay> was created without expected prop 'messagesAveraging'");
    		}
    	});

    	const writable_props = ['sentimentAnalysisResponse', 'messagesAveraging'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<SentiDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('sentimentAnalysisResponse' in $$props) $$invalidate(2, sentimentAnalysisResponse = $$props.sentimentAnalysisResponse);
    		if ('messagesAveraging' in $$props) $$invalidate(0, messagesAveraging = $$props.messagesAveraging);
    	};

    	$$self.$capture_state = () => ({
    		sentimentAnalysisResponse,
    		messagesAveraging,
    		Buffer,
    		sentiSrc,
    		renderImage
    	});

    	$$self.$inject_state = $$props => {
    		if ('sentimentAnalysisResponse' in $$props) $$invalidate(2, sentimentAnalysisResponse = $$props.sentimentAnalysisResponse);
    		if ('messagesAveraging' in $$props) $$invalidate(0, messagesAveraging = $$props.messagesAveraging);
    		if ('sentiSrc' in $$props) $$invalidate(1, sentiSrc = $$props.sentiSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [messagesAveraging, sentiSrc, sentimentAnalysisResponse];
    }

    class SentiDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			sentimentAnalysisResponse: 2,
    			messagesAveraging: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SentiDisplay",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get sentimentAnalysisResponse() {
    		throw new Error("<SentiDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sentimentAnalysisResponse(value) {
    		throw new Error("<SentiDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messagesAveraging() {
    		throw new Error("<SentiDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messagesAveraging(value) {
    		throw new Error("<SentiDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Analyses.svelte generated by Svelte v3.55.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/Analyses.svelte";

    // (136:4) <Dialog bind:value={showFirstDialog}>
    function create_default_slot_2(ctx) {
    	let p;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let a;
    	let t4;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Currently, an API is processing the messages to extract and display\n        information. For the sentiment analysis plot, approximately 5 messages\n        are analyzed per second.\n        ");
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			t2 = text(" \n        Work like this requires a constantly running server. To support developers and projects like\n        this, please consider starring the \n        ");
    			a = element("a");
    			a.textContent = "repository";
    			t4 = text("\n        for this project.");
    			add_location(br0, file$1, 141, 8, 4212);
    			add_location(br1, file$1, 141, 15, 4219);
    			attr_dev(a, "href", "https://github.com/anish-lakkapragada/club-discords-nlp");
    			add_location(a, file$1, 144, 8, 4380);
    			set_style(p, "text-align", "center");
    			add_location(p, file$1, 137, 6, 3984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, br0);
    			append_dev(p, t1);
    			append_dev(p, br1);
    			append_dev(p, t2);
    			append_dev(p, a);
    			append_dev(p, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(136:4) <Dialog bind:value={showFirstDialog}>",
    		ctx
    	});

    	return block;
    }

    // (137:6) 
    function create_title_slot(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "This will take some time.";
    			attr_dev(h3, "slot", "title");
    			add_location(h3, file$1, 136, 6, 3930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(137:6) ",
    		ctx
    	});

    	return block;
    }

    // (151:8) <Button text on:click={() => (showFirstDialog = false)}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("I starred the repo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(151:8) <Button text on:click={() => (showFirstDialog = false)}>",
    		ctx
    	});

    	return block;
    }

    // (150:6) 
    function create_actions_slot(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[9]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "actions");
    			add_location(div, file$1, 149, 6, 4525);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot.name,
    		type: "slot",
    		source: "(150:6) ",
    		ctx
    	});

    	return block;
    }

    // (159:2) {:else}
    function create_else_block_1(ctx) {
    	let h5;
    	let t1;
    	let div;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				id: "progress-bar",
    				indeterminate: true,
    				radius: 40,
    				thickness: 10,
    				color: "blue"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "WordCloud On The Way!";
    			t1 = space();
    			div = element("div");
    			create_component(progresscircular.$$.fragment);
    			attr_dev(h5, "id", "wordcloud-unloaded");
    			attr_dev(h5, "class", "svelte-1190oy2");
    			add_location(h5, file$1, 159, 4, 4777);
    			attr_dev(div, "class", "progress-bar");
    			add_location(div, file$1, 160, 4, 4836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(progresscircular, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(159:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (157:2) {#if wordCloudLoaded}
    function create_if_block_1(ctx) {
    	let wordclouddisplay;
    	let current;

    	wordclouddisplay = new WordCloudDisplay({
    			props: {
    				wordCloudResponse: /*wordCloudResponse*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(wordclouddisplay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wordclouddisplay, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wordclouddisplay_changes = {};
    			if (dirty & /*wordCloudResponse*/ 16) wordclouddisplay_changes.wordCloudResponse = /*wordCloudResponse*/ ctx[4];
    			wordclouddisplay.$set(wordclouddisplay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wordclouddisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wordclouddisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wordclouddisplay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(157:2) {#if wordCloudLoaded}",
    		ctx
    	});

    	return block;
    }

    // (174:2) {:else}
    function create_else_block$1(ctx) {
    	let h5;
    	let t1;
    	let div;
    	let progresscircular;
    	let current;

    	progresscircular = new ProgressCircular({
    			props: {
    				id: "progress-bar",
    				indeterminate: true,
    				radius: 40,
    				thickness: 10,
    				color: "blue"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Sentiment Analysis On The Way!";
    			t1 = space();
    			div = element("div");
    			create_component(progresscircular.$$.fragment);
    			attr_dev(h5, "id", "wordcloud-unloaded");
    			attr_dev(h5, "class", "svelte-1190oy2");
    			add_location(h5, file$1, 174, 4, 5143);
    			attr_dev(div, "class", "progress-bar");
    			add_location(div, file$1, 175, 4, 5211);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(progresscircular, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(progresscircular);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(174:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (172:2) {#if sentimentAnalysisLoaded}
    function create_if_block$1(ctx) {
    	let sentidisplay;
    	let current;

    	sentidisplay = new SentiDisplay({
    			props: {
    				sentimentAnalysisResponse: /*sentimentAnalysisResponse*/ ctx[5],
    				messagesAveraging: /*messagesAveraging*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sentidisplay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sentidisplay, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sentidisplay_changes = {};
    			if (dirty & /*sentimentAnalysisResponse*/ 32) sentidisplay_changes.sentimentAnalysisResponse = /*sentimentAnalysisResponse*/ ctx[5];
    			if (dirty & /*messagesAveraging*/ 1) sentidisplay_changes.messagesAveraging = /*messagesAveraging*/ ctx[0];
    			sentidisplay.$set(sentidisplay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sentidisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sentidisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sentidisplay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(172:2) {#if sentimentAnalysisLoaded}",
    		ctx
    	});

    	return block;
    }

    // (133:0) <SozaiApp>
    function create_default_slot$1(ctx) {
    	let h2;
    	let t0;
    	let i;
    	let t2;
    	let t3;
    	let div;
    	let dialog;
    	let updating_value;
    	let t4;
    	let current_block_type_index;
    	let if_block0;
    	let t5;
    	let current_block_type_index_1;
    	let if_block1;
    	let if_block1_anchor;
    	let current;

    	function dialog_value_binding(value) {
    		/*dialog_value_binding*/ ctx[10](value);
    	}

    	let dialog_props = {
    		$$slots: {
    			actions: [create_actions_slot],
    			title: [create_title_slot],
    			default: [create_default_slot_2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showFirstDialog*/ ctx[1] !== void 0) {
    		dialog_props.value = /*showFirstDialog*/ ctx[1];
    	}

    	dialog = new Dialog({ props: dialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog, 'value', dialog_value_binding, /*showFirstDialog*/ ctx[1]));
    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*wordCloudLoaded*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block$1, create_else_block$1];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*sentimentAnalysisLoaded*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("Discord Channel Analyzer - ");
    			i = element("i");
    			i.textContent = "Analysis Page ";
    			t2 = text("!");
    			t3 = space();
    			div = element("div");
    			create_component(dialog.$$.fragment);
    			t4 = space();
    			if_block0.c();
    			t5 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			add_location(i, file$1, 133, 33, 3832);
    			add_location(h2, file$1, 133, 2, 3801);
    			attr_dev(div, "id", "dialog");
    			attr_dev(div, "class", "svelte-1190oy2");
    			add_location(div, file$1, 134, 2, 3863);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, i);
    			append_dev(h2, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(dialog, div, null);
    			insert_dev(target, t4, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if_blocks_1[current_block_type_index_1].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dialog_changes = {};

    			if (dirty & /*$$scope, showFirstDialog*/ 16386) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*showFirstDialog*/ 2) {
    				updating_value = true;
    				dialog_changes.value = /*showFirstDialog*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			dialog.$set(dialog_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t5.parentNode, t5);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			destroy_component(dialog);
    			if (detaching) detach_dev(t4);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t5);
    			if_blocks_1[current_block_type_index_1].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(133:0) <SozaiApp>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let sozaiapp;
    	let current;

    	sozaiapp = new SozaiApp({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sozaiapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sozaiapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sozaiapp_changes = {};

    			if (dirty & /*$$scope, sentimentAnalysisResponse, messagesAveraging, sentimentAnalysisLoaded, wordCloudResponse, wordCloudLoaded, showFirstDialog*/ 16447) {
    				sozaiapp_changes.$$scope = { dirty, ctx };
    			}

    			sozaiapp.$set(sozaiapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sozaiapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sozaiapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sozaiapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const API_URL = "8938-150-230-44-145.jp.ngrok.io";

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Analyses', slots, []);
    	let { discordJSON } = $$props;
    	let { bannedWords } = $$props;
    	let { channelName } = $$props;
    	let { messagesAveraging } = $$props;
    	let showFirstDialog = true;
    	let wordCloudLoaded = false;
    	let sentimentAnalysisLoaded = false;
    	let wordCloudResponse, sentimentAnalysisResponse;

    	const bannedString = Array.from(bannedWords).length > 0
    	? [...bannedWords].reduce((prev, next) => prev + "," + next)
    	: "";

    	console.log(bannedString);

    	// get the wordcloud image back
    	async function getWordCloud() {
    		$$invalidate(6, discordJSON["bannedWords"] = bannedString, discordJSON);
    		const controller = new AbortController();
    		const id = setTimeout(() => controller.abort(), 20 * 60 * 1000);

    		$$invalidate(4, wordCloudResponse = await fetch(`https://${API_URL}/wordcloud`, {
    			method: "POST",
    			mode: "cors",
    			body: JSON.stringify(discordJSON),
    			signal: controller.signal,
    			headers: { "Content-Type": "application/json" }
    		}));

    		clearTimeout(id);

    		if (wordCloudResponse.status != 200) {
    			const data = await wordCloudResponse.json();
    			console.warn(data);
    		}

    		$$invalidate(2, wordCloudLoaded = true);
    	}

    	async function getSentimentAnalysis() {
    		$$invalidate(6, discordJSON["title"] = `Sentiment Analysis in ${channelName} Over Time`, discordJSON);
    		$$invalidate(6, discordJSON["messagesAveraging"] = messagesAveraging, discordJSON);

    		// let socket = new WebSocket(`wss://${API_URL}/senti`);
    		// socket.onopen = function (e) {
    		//   console.log("starting it up");
    		//   socket.send(JSON.stringify(discordJSON));
    		//   console.log("just sent the stuff!");
    		// };
    		// socket.onmessage = function (event) {
    		//   console.log(event.data);
    		//   sentimentAnalysisResponse = event.data;
    		//   if (sentimentAnalysisResponse != null) {
    		//     sentimentAnalysisLoaded = true;
    		//   }
    		//   // socket.close(1000, "bruh"); // close the socket connection
    		// };
    		// socket.onclose = function (event) {
    		//   if (event.wasClean) {
    		//     console.log(
    		//       `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    		//     );
    		//   } else {
    		//     console.log(event);
    		//     console.log("[close] Connection died");
    		//   }
    		// };
    		// socket.onerror = function (error) {
    		//   console.log(error);
    		//   alert(`[error]`);
    		// };
    		// const controller = new AbortController();
    		// const id = setTimeout(() => controller.abort(), 20 * 60 * 1000);
    		const sendRequest = await fetch(`https://${API_URL}/senti`, {
    			method: "POST",
    			mode: "cors",
    			body: JSON.stringify(discordJSON),
    			headers: {
    				"Content-Type": "application/json",
    				"ngrok-skip-browser-warning": true
    			}
    		});

    		const idData = await sendRequest.json();
    		console.log(idData);

    		var thisInterval = setInterval(
    			async () => {
    				const doneYet = await fetch(`https://${API_URL}/senti/${idData.uuid}`, {
    					method: "GET",
    					mode: "cors",
    					headers: { "ngrok-skip-browser-warning": true }
    				});

    				console.log(doneYet);

    				if (doneYet.status == 200) {
    					$$invalidate(5, sentimentAnalysisResponse = doneYet);
    					$$invalidate(3, sentimentAnalysisLoaded = true);
    					clearInterval(thisInterval);
    				}
    			},
    			5000
    		);
    	} // clearTimeout(id);
    	// console.log("Here");

    	// console.log(sentimentAnalysisResponse);
    	// if (sentimentAnalysisResponse.status != 200) {
    	//   const data = await sentimentAnalysisResponse.json();
    	//   console.warn(data);
    	// }
    	getSentimentAnalysis();

    	getWordCloud();

    	$$self.$$.on_mount.push(function () {
    		if (discordJSON === undefined && !('discordJSON' in $$props || $$self.$$.bound[$$self.$$.props['discordJSON']])) {
    			console_1.warn("<Analyses> was created without expected prop 'discordJSON'");
    		}

    		if (bannedWords === undefined && !('bannedWords' in $$props || $$self.$$.bound[$$self.$$.props['bannedWords']])) {
    			console_1.warn("<Analyses> was created without expected prop 'bannedWords'");
    		}

    		if (channelName === undefined && !('channelName' in $$props || $$self.$$.bound[$$self.$$.props['channelName']])) {
    			console_1.warn("<Analyses> was created without expected prop 'channelName'");
    		}

    		if (messagesAveraging === undefined && !('messagesAveraging' in $$props || $$self.$$.bound[$$self.$$.props['messagesAveraging']])) {
    			console_1.warn("<Analyses> was created without expected prop 'messagesAveraging'");
    		}
    	});

    	const writable_props = ['discordJSON', 'bannedWords', 'channelName', 'messagesAveraging'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Analyses> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, showFirstDialog = false);

    	function dialog_value_binding(value) {
    		showFirstDialog = value;
    		$$invalidate(1, showFirstDialog);
    	}

    	$$self.$$set = $$props => {
    		if ('discordJSON' in $$props) $$invalidate(6, discordJSON = $$props.discordJSON);
    		if ('bannedWords' in $$props) $$invalidate(7, bannedWords = $$props.bannedWords);
    		if ('channelName' in $$props) $$invalidate(8, channelName = $$props.channelName);
    		if ('messagesAveraging' in $$props) $$invalidate(0, messagesAveraging = $$props.messagesAveraging);
    	};

    	$$self.$capture_state = () => ({
    		discordJSON,
    		bannedWords,
    		channelName,
    		messagesAveraging,
    		ProgressCircular,
    		SozaiApp,
    		Dialog,
    		Button,
    		WordCloudDisplay,
    		SentiDisplay,
    		API_URL,
    		showFirstDialog,
    		wordCloudLoaded,
    		sentimentAnalysisLoaded,
    		wordCloudResponse,
    		sentimentAnalysisResponse,
    		bannedString,
    		getWordCloud,
    		getSentimentAnalysis
    	});

    	$$self.$inject_state = $$props => {
    		if ('discordJSON' in $$props) $$invalidate(6, discordJSON = $$props.discordJSON);
    		if ('bannedWords' in $$props) $$invalidate(7, bannedWords = $$props.bannedWords);
    		if ('channelName' in $$props) $$invalidate(8, channelName = $$props.channelName);
    		if ('messagesAveraging' in $$props) $$invalidate(0, messagesAveraging = $$props.messagesAveraging);
    		if ('showFirstDialog' in $$props) $$invalidate(1, showFirstDialog = $$props.showFirstDialog);
    		if ('wordCloudLoaded' in $$props) $$invalidate(2, wordCloudLoaded = $$props.wordCloudLoaded);
    		if ('sentimentAnalysisLoaded' in $$props) $$invalidate(3, sentimentAnalysisLoaded = $$props.sentimentAnalysisLoaded);
    		if ('wordCloudResponse' in $$props) $$invalidate(4, wordCloudResponse = $$props.wordCloudResponse);
    		if ('sentimentAnalysisResponse' in $$props) $$invalidate(5, sentimentAnalysisResponse = $$props.sentimentAnalysisResponse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		messagesAveraging,
    		showFirstDialog,
    		wordCloudLoaded,
    		sentimentAnalysisLoaded,
    		wordCloudResponse,
    		sentimentAnalysisResponse,
    		discordJSON,
    		bannedWords,
    		channelName,
    		click_handler,
    		dialog_value_binding
    	];
    }

    class Analyses extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			discordJSON: 6,
    			bannedWords: 7,
    			channelName: 8,
    			messagesAveraging: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Analyses",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get discordJSON() {
    		throw new Error("<Analyses>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set discordJSON(value) {
    		throw new Error("<Analyses>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bannedWords() {
    		throw new Error("<Analyses>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bannedWords(value) {
    		throw new Error("<Analyses>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channelName() {
    		throw new Error("<Analyses>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channelName(value) {
    		throw new Error("<Analyses>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messagesAveraging() {
    		throw new Error("<Analyses>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messagesAveraging(value) {
    		throw new Error("<Analyses>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.55.0 */
    const file = "src/App.svelte";

    // (25:4) {:else}
    function create_else_block(ctx) {
    	let analyses;
    	let current;

    	analyses = new Analyses({
    			props: {
    				discordJSON: /*discordJSON*/ ctx[1],
    				bannedWords: /*bannedWords*/ ctx[2],
    				channelName: /*channelName*/ ctx[3],
    				messagesAveraging: /*messagesAveraging*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(analyses.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(analyses, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const analyses_changes = {};
    			if (dirty & /*discordJSON*/ 2) analyses_changes.discordJSON = /*discordJSON*/ ctx[1];
    			if (dirty & /*bannedWords*/ 4) analyses_changes.bannedWords = /*bannedWords*/ ctx[2];
    			if (dirty & /*channelName*/ 8) analyses_changes.channelName = /*channelName*/ ctx[3];
    			if (dirty & /*messagesAveraging*/ 16) analyses_changes.messagesAveraging = /*messagesAveraging*/ ctx[4];
    			analyses.$set(analyses_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(analyses.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(analyses.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(analyses, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(25:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if !submitted}
    function create_if_block(ctx) {
    	let onopen;
    	let current;
    	onopen = new OnOpen({ $$inline: true });
    	onopen.$on("submittedTxt", /*submittedTxt_handler*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(onopen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(onopen, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(onopen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(onopen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(onopen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(15:4) {#if !submitted}",
    		ctx
    	});

    	return block;
    }

    // (14:2) <SozaiApp>
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*submitted*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:2) <SozaiApp>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let sozaiapp;
    	let current;

    	sozaiapp = new SozaiApp({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(sozaiapp.$$.fragment);
    			attr_dev(main, "class", "svelte-1e9puaw");
    			add_location(main, file, 12, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(sozaiapp, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sozaiapp_changes = {};

    			if (dirty & /*$$scope, submitted, discordJSON, bannedWords, channelName, messagesAveraging*/ 159) {
    				sozaiapp_changes.$$scope = { dirty, ctx };
    			}

    			sozaiapp.$set(sozaiapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sozaiapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sozaiapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(sozaiapp);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	let submitted = false;
    	let discordJSON;
    	let bannedWords;
    	let channelName;
    	let messagesAveraging;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const submittedTxt_handler = e => {
    		$$invalidate(0, submitted = true);
    		$$invalidate(1, discordJSON = e.detail.discordJSON);
    		$$invalidate(2, bannedWords = e.detail.bannedWords);
    		$$invalidate(3, channelName = e.detail.channelName);
    		$$invalidate(4, messagesAveraging = e.detail.messagesAveraging);
    	};

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(5, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		SozaiApp,
    		Button,
    		OnOpen,
    		Analyses,
    		submitted,
    		discordJSON,
    		bannedWords,
    		channelName,
    		messagesAveraging
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(5, name = $$props.name);
    		if ('submitted' in $$props) $$invalidate(0, submitted = $$props.submitted);
    		if ('discordJSON' in $$props) $$invalidate(1, discordJSON = $$props.discordJSON);
    		if ('bannedWords' in $$props) $$invalidate(2, bannedWords = $$props.bannedWords);
    		if ('channelName' in $$props) $$invalidate(3, channelName = $$props.channelName);
    		if ('messagesAveraging' in $$props) $$invalidate(4, messagesAveraging = $$props.messagesAveraging);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		submitted,
    		discordJSON,
    		bannedWords,
    		channelName,
    		messagesAveraging,
    		name,
    		submittedTxt_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, { name: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
