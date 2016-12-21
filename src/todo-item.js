/**
 * This module defines the "todo-item" custom element which extends the `<li>` element.
 *
 * @module
 */
import html from './todo-item.html';
import CustomElement from './custom-element';

const template = document.createElement( 'template' );
template.innerHTML = html;

// TODO: event.key is not supported in Safari
function isEscape( keyboardEvent ) {
	return keyboardEvent.key === 'Escape';
}

/**
 * Class for the "todo-item" custom element. It extends the `<li>` element.
 */
export default class TodoItem extends CustomElement( HTMLLIElement ) {
	/**
	 * Attributes to observe: completed, editing, and title.
	 */
	static get observedAttributes() {
		return [ 'completed', 'editing', 'title' ];
	}

	/**
	 * Indicates whether or not `this` todo item is completed.
	 *
	 * @returns {boolean} `true` if this item is completed, `false` otherwise.
	 */
	get completed() {
		return this.hasAttribute( 'completed' );
	}

	/**
	 * Change the **completed** state of this item.
	 *
	 * @param {boolean} value
	 */
	set completed( value ) {
		if ( value ) {
			this.setAttribute( 'completed', '' );
		} else {
			this.removeAttribute( 'completed' );
		}
	}

	/**
	 * Indicates whether or not `this` todo item is currently editable.
	 *
	 * @returns {boolean} `true` if this item in edit mode, `false` otherwise.
	 */
	get editing() {
		return this.hasAttribute( 'editing' );
	}

	/**
	 * Switches this todo item into edit mode if the given `value` is `true`.
	 *
	 * @param {boolean} value
	 */
	set editing( value ) {
		if ( value ) {
			this.setAttribute( 'editing', '' );
		} else {
			this.removeAttribute( 'editing' );
		}
	}

	/**
	 * The title of this todo item.
	 *
	 * @param {string}
	 */
	get title() {
		return this.getAttribute( 'title' );
	}

	/**
	 * Changes the title of this todo item.
	 *
	 * @param {string}
	 */
	set title( value ) {
		this.setAttribute( 'title', value || '' );
	}

	/**
	 * The unique identifier of this todo item.
	 *
	 * @returns {number} The item ID (integer) or `null` if it doesn't have an ID.
	 */
	get id() {
		const id = this.getAttribute( 'id' );
		return /^\d+$/.test( id ) ? parseInt( id, 10 ) : null;
	}

	/**
	 * Change the ID of this todo item.
	 *
	 * @param {number} The new ID for this item, must be an integer.
	 */
	set id( id ) {
		// Make sure the value of `count` is an integer.
		if ( !/^\d+$/.test( `${ id }` ) ) {
			throw new Error( 'Only integers are allowed as the id of items.' );
		}

		this.setAttribute( 'id', id );
	}

	/**
	 * Convenience property to access the `<input>` text field.
	 */
	get input() {
		return this._input || ( this._input = this.querySelector( 'input[type="text"]' ) );
	}

	/**
	 * Called whenever one of the `observedAttributes` is changed. 
	 *
	 * @param {string} name Name of the attribute that was changed.
	 * @param old Old value.
	 * @param current New value.
	 */
	attributeChangedCallback( name, old, current ) {
		if ( name === 'completed' ) {
			// Toggle "completed" class if the completed attribute was changed.
			this.classList.toggle( 'completed', this.completed );
		} else if ( name === 'editing' ) {
			// Toggle "editing" class and focus on the input, if the editing attribute was changed.
			this.classList.toggle( 'editing', this.editing );
			if ( this.editing ) {
				this.input.focus();
			}
		}

		if ( !this._isConnected ) {
			return;
		}

		if ( name === 'completed' ) {
			// Update the checkbox if the completed attribute was changed.
			this.infuseElement( 'input[type="checkbox"]' );
		} else if ( name === 'title' ) {
			// Update the label and text field if the title attribute was changed.
			this.infuseElements( 'label, input[type="text"]' );
		}
	}

	/**
	 * Renders the contents of this element.
	 */
	connectedCallback() {
		let fragment = this.cloneTemplate( template ),
			form, button;

		this.appendChild( fragment );
		this._isConnected = true;

		// Set a listener that updates the item when the form is submitted.
		form = this.querySelector( 'form' );
		form.addEventListener( 'submit', e => this._update( e ) );

		// Set a listener that destroys the item when the ".destroy" button is clicked.
		button = this.querySelector( '.destroy' );
		button.addEventListener( 'click', e => this.dispatch( 'remove-todo', { id: this.id } ) );

		// Update the item when the input text field loses focus.
		this.input.addEventListener( 'blur', e => this.editing && this._update() );

		// Revert changes made to the input text field if the Esc key is pressed.
		this.input.addEventListener( 'keydown', e => isEscape( e ) && this.revert() );

		// Enter into edit mode when the `<label>` is double clicked.
		this.querySelector( 'label' ).addEventListener( 'dblclick', e => this.editing = true );

		// Update the item when the "completed" checkbox is clicked.
		this.querySelector( '.toggle' ).addEventListener( 'click',
			e => this.dispatchUpdate({ id: this.id, completed: e.target.checked })
		);
	}

	/**
	 * Dispatches an "update-todo" `CustomEvent` and exits the edit mode.
	 *
	 * @param {Event} [event]
	 */
	_update( event ) {
		this.dispatchUpdate({
			id: this.id,
			title: this.input.value
		});

		this.editing = false;
		event && event.preventDefault();
	}

	/**
	 * Reverts any changes made to the input text field and exits the edit mode.
	 */
	revert() {
		this.input.value = this.title;
		this.editing = false;
	}

	/**
	 * Dispatched an "update-todo" `CustomEvent`.
	 *
	 * @param {object} item The todo item to use as the event's detail property.
	 */
	dispatchUpdate( item ) {
		this.dispatch( 'update-todo', item );
	}
}

customElements.define( 'todo-item', TodoItem, { extends: 'li' } );