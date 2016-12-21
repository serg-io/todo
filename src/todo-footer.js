/**
 * This module defines the "todo-footer" custom element which extends the `<footer>` element.
 *
 * @module
 */
import html from './todo-footer.html';
import CustomElement from './custom-element';

const template = document.createElement( 'template' );
template.innerHTML = html;

/**
 * Class for the "todo-footer" custom element. Even though this element extends the `<footer>`
 * element, a base class is not passed to the `CustomElement` function because the interface
 * for `<footer>` elements is `HTMLElement` (`CustomElement` uses `HTMLElement` by default):
 * https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
 */
export default class TodoFooter extends CustomElement() {
	/**
	 * Attributes to observe: active and completed. The `attributeChangedCallback` method is
	 * called whenever these attributes are changed.
	 */
	static get observedAttributes() {
		return [ 'active', 'completed' ];
	}

	/**
	 * Returns the number of **active** todo items.
	 *
	 * @returns {number}
	 */
	get active() {
		let count = this.getAttribute( 'active' );
		return /^\d+$/.test( count ) ? parseInt( count, 10 ) : 0;
	}

	/**
	 * Sets the number of **active** todo items.
	 *
	 * @param {number} count The number of active items. Must be an integer.
	 */
	set active( count ) {
		// Make sure the value of `count` is an integer.
		if ( !/^\d+$/.test( `${ count }` ) ) {
			throw new Error( 'Only integers are allowed as the number of "active" items.' );
		}

		this.setAttribute( 'active', count );
	}

	/**
	 * Returns the number of **completed** todo items.
	 *
	 * @returns {number}
	 */
	get completed() {
		let count = this.getAttribute( 'completed' );
		return /^\d+$/.test( count ) ? parseInt( count, 10 ) : 0;
	}

	/**
	 * Sets the number of **completed** todo items.
	 *
	 * @param {number} count The number of completed items. Must be an integer.
	 */
	set completed( count ) {
		// Make sure the value of `count` is an integer.
		if ( !/^\d+$/.test( `${ count }` ) ) {
			throw new Error( 'Only integers are allowed as the number of "completed" items.' );
		}

		this.setAttribute( 'completed', count );
	}

	/**
	 * Called whenever the "active" or "completed" attributes are changed. It updates the counter
	 * when the "active" attribute is changed and hides/shows the "Clear completed" button when
	 * the "completed" attribute is changed. It does nothing if the attributes are changed when
	 * `this` element is not connected yet.
	 *
	 * @param {string} name Name of the attribute that was changed.
	 * @param old Old value.
	 * @param current New value.
	 */
	attributeChangedCallback( name, old, current ) {
		// Do nothing if it's not connected.
		if ( !this._isConnected ) {
			return;
		}

		// Infuse `<span>` if "active" was changed, infuse `<button>` otherwise.
		this.infuseElement( name === 'active' ? 'span' : 'button' );
	}

	/**
	 * Renders the contents of this element.
	 */
	connectedCallback() {
		let fragment = this.cloneTemplate( template ),
			button;

		this.appendChild( fragment );
		this._isConnected = true;
		button = this.querySelector( 'button' );

		// Dispatch a "clear-completed" event when the "Clear completed" button is clicked.
		button.addEventListener( 'click', e => this.dispatch( 'clear-completed' ) );
	}

	/**
	 * Returns a string indicating how many **active** items are left.
	 *
	 * @returns {string}
	 */
	get itemsLeft() {
		let active = this.active,
			items = active === 1 ? 'item' : 'items';

		return `${ active } ${ items } left`;
	}
}

customElements.define( 'todo-footer', TodoFooter, { extends: 'footer' } );