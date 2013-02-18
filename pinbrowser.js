/*
Pinbrowser — Pintrest Style Lightbox
https://github.com/vincentboiardt/pinbrowser
*/
(function( $ ) {
	var PinBrowser = function( options ) {
		this.settings = $.extend( {
			controls: true,
			showCloseLink: true,
			closeLinkText: 'Close',
			clickToClose: true,
			keyboardEnabled: false,
			fadeTime: 200
		}, options );
		
		this.wrap = $('.pinbrowser').length > 0 ? $('.pinbrowser') : $('<div class="pinbrowser" />').appendTo( $('body') ).hide();
		this.browserWrap = $('.pinbrowser .browser-wrap').length > 0 ? $('.pinbrowser .browser-wrap') : $('<div class="browser-wrap" />').appendTo( this.wrap );
		this.browser = $('.pinbrowser .browser').length > 0 ? $('.pinbrowser .browser') : $('<div class="browser" />').appendTo( this.browserWrap );
		this.elements = $(this.settings.elements);
		this.elements.on( 'click', $.proxy( this.onClick, this ) );
		
		if ( this.settings.controls ) {
			this.controlNext = $('.pinbrowser .control.next').length > 0 ? $('.pinbrowser .control.next') : $('<div class="control next">→<div class="tip" /></div>').appendTo( this.browserWrap ).click( $.proxy( this.onControlClick, this ) ).hover( $.proxy( this.onControlHover, this ) );
			this.controlPrev = $('.pinbrowser .control.prev').length > 0 ? $('.pinbrowser .control.prev') : $('<div class="control prev">←<div class="tip" /></div>').appendTo( this.browserWrap ).click( $.proxy( this.onControlClick, this ) ).hover( $.proxy( this.onControlHover, this ) );
		}
		if ( this.settings.clickToClose ) {
			this.wrap.click( $.proxy( function(e){
				if ( $(e.target).hasClass('pinbrowser') )
					this.toggle();
			}, this ) );
		}
		if ( this.settings.showCloseLink ) {
			$( '<div class="pin-close">' + this.settings.closeLinkText + '</div>' ).appendTo( this.browserWrap ).click( $.proxy( this.toggle, this ) );
		}
		if ( this.settings.keyboardEnabled ) {
			$(document).keydown( $.proxy( this.onKey, this ) );
		}
	};
	PinBrowser.prototype = {
		currentIndex: 0,
		isOpen: false,
		onClick: function(e) {
			e.preventDefault();
			
			if ( ! this.isOpen )
				this.toggle();
			
			var index = $(e.target).index( this.settings.elements );
			
			this.goTo( index );
		},
		onControlClick: function(e) {
			if ( $(e.target).hasClass('next') ) {
				this.currentIndex++;
				
				if ( this.currentIndex == this.elements.length )
					this.currentIndex = 0;
			} else {
				this.currentIndex--;
				
				if ( this.currentIndex < 0 )
					this.currentIndex = this.elements.length - 1;
			}
			this.goTo(this.currentIndex);
		},
		onControlHover: function(e) {
			var index = this.currentIndex - 1,
				control = this.controlPrev;
			
			if ( index < 0 )
				index = this.elements.length - 1;
			
			if ( $(e.target).hasClass('next') ) {
				index = this.currentIndex + 1;
				
				if ( index == this.elements.length )
					index = 0;
				
				control = this.controlNext;
			}
			control.find('.tip').toggle().text( this.elements.eq( index ).text() );
		},
		onLoaded: function() {
			this.browser.removeClass('loading');
			
			if ( typeof this.settings.load == 'function' )
				this.settings.load.call();
		},
		onKey: function(e) {
			if ( this.isOpen && e.keyCode ) {
				switch ( e.keyCode ) {
					case 27 :
						this.toggle();
						break;
					case 39 :
						this.controlNext.trigger('click');
						break;
					case 37 :
						this.controlPrev.trigger('click');
					break;
				}
			}
		},
		toggle: function() {
			this.wrap.fadeToggle( this.settings.fadeTime, $.proxy( function(){
				$('body').toggleClass('pinbrowser-noscroll');
				
				this.isOpen = $('body').hasClass('pinbrowser-noscroll');
				
				if ( ! this.isOpen ) {
					// Reset
					this.browser.empty();
					this.browserWrap.attr('style', '');
					this.wrap.attr('height', '');
					
					if ( this.settings.controls ) {
						this.controlNext.show().find('.tip').hide();
						this.controlPrev.show().find('.tip').hide();
					}
				}
			}, this ) );
		},
		goTo: function(index) {
			var el = this.elements.eq(index);
			
			this.currentIndex = index;
			
			this.browser.addClass('loading').load( el.attr('href') + ' ' + this.settings.loadSelector, $.proxy( this.onLoaded, this ) );
		},
		showModal: function(selector, options) {
			if ( this.settings.controls ) {
				this.controlNext.hide();
				this.controlPrev.hide();
			}
			this.toggle();
			this.browser.empty().append( $(selector) );
			
			if ( options.width )
				this.browserWrap.width(options.width);
			
			if ( options.height )
				this.browserWrap.height(options.height);
			
			if ( options.center ) {
				this.wrap.css( 'height', '100%' );
				this.browserWrap.css( 'top', '50%' );
				this.browserWrap.css( 'margin-top', -( this.browserWrap.height() / 2 ) );
			}
		},
		update: function() {
			this.elements = $(this.settings.elements);
		}
	};
	$.pinBrowser = function( options ) {
		return new PinBrowser( options );
	};
})( jQuery );