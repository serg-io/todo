/**
 * This module defines a mixin function, which can be used to declare classes for custom elements.
 *
 * @module
 */
import 'dom4';
import 'document-register-element';
import 'dre-shim';
import { Mixin } from 'template-infuse';

/**
 * Uses `TemplateInfuse.Mixin` to create a custom element class.
 *
 * @function CustomElement
 * @param [Class=HTMLElement] The class of the HTML element to extend.
 * @param {Document} [ownerDocument] The document that contains the `<template>` elements.
 * @returns The new custom element class.
 */
export default function CustomElement( Class, ownerDocument ) {
	/**
	 * The third argument (`true`) enables a workaround for the Custom Elements v1 caveat when
	 * using the "document-register-element" polyfill:
	 * https://github.com/WebReflection/document-register-element#v1-caveat
	 */
	return class extends Mixin( Class, ownerDocument, true ) {
		/**
		 * Find and return the element (descendant of `this` custom element) that has the given ID.
		 * This method escapes the ID's first character if it's a digit:
		 * http://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
		 *
		 * @param {(string|number)} id The element's ID.
		 * @returns The element with the given ID that is a descendant of `this` custom element.
		 */
		byId( id ) {
			id = ( '#' + id ).replace( /^#(\d)/, ( match, firstDigit ) => `#\\3${firstDigit} ` );
			return this.querySelector( id );
		}

		/**
		 * Dispatches a `CustomEvent`. Events dispatched by this method are cancelable and bubble
		 * up the DOM tree.
		 *
		 * @param {string} name The name of the `CustomEvent`.
		 * @param [detail=null] The value to use as the event's `detail` property. If not provided,
		 *     `null` is used by default.
		 */
		dispatch( name, detail = null ) {
			const eventInit = {
				detail,
				bubbles: true,
				cancelable: true
			};

			this.dispatchEvent( new CustomEvent( name, eventInit ) );
		}
	};
}