odoo.define('pos_qty_weight_product.screens', function(require){
    "use strict";
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;
    var field_utils = require('web.field_utils');
    var BarcodeEvents = require('barcodes.BarcodeEvents').BarcodeEvents;
    //const { qweb } = require('web.core');

    var ScaleManualWidget = screens.ScreenWidget.extend({
        template: "ScaleManualWidget",
        events: {
            'click .back': 'back',
            'click .next': 'next',
            'click .btn-add-product': 'addprod',
        },

        init: function(parent, options) {
                var self = this;
                this._super(parent, options);
                this.set_weight(0);
                this.reset_input();
                this.renderElement();
                this.inputbuffer = "";
                this.firstinput  = true;
                this.decimal_point = _t.database.parameters.decimal_point;

                // This is a keydown handler that prevents backspace from
                // doing a back navigation. It also makes sure that keys that
                // do not generate a keypress in Chrom{e,ium} (eg. delete,
                // backspace, ...) get passed to the keypress handler.
                this.keyboard_keydown_handler = function(event){
                    if (event.keyCode === 8 || event.keyCode === 46) { // Backspace and Delete
                        event.preventDefault();

                        // These do not generate keypress events in
                        // Chrom{e,ium}. Even if they did, we just called
                        // preventDefault which will cancel any keypress that
                        // would normally follow. So we call keyboard_handler
                        // explicitly with this keydown event.
                        self.keyboard_handler(event);
                    }
                };

                // This keyboard handler listens for keypress events. It is
                // also called explicitly to handle some keydown events that
                // do not generate keypress events.
                this.keyboard_handler = function(event){
                    // On mobile Chrome BarcodeEvents relies on an invisible
                    // input being filled by a barcode device. Let events go
                    // through when this input is focused.
                    if (BarcodeEvents.$barcodeInput && BarcodeEvents.$barcodeInput.is(":focus")) {
                        return;
                    }

                    var key = '';

                    if (event.type === "keypress") {
                        if (event.keyCode === 13) { // Enter
                            //self.validate_order();
                            self.gui.show_screen('products');
                            self.order_product();
                        } else if ( event.keyCode === 190 || // Dot
                                    event.keyCode === 110 ||  // Decimal point (numpad)
                                    event.keyCode === 44 ||  // Comma
                                    event.keyCode === 46 ) {  // Numpad dot
                            key = self.decimal_point;
                        } else if (event.keyCode >= 48 && event.keyCode <= 57) { // Numbers
                            key = '' + (event.keyCode - 48);
                        } else if (event.keyCode === 45) { // Minus
                            key = '-';
                        } else if (event.keyCode === 43) { // Plus
                            key = '+';
                        }
                    } else { // keyup/keydown
                        if (event.keyCode === 46) { // Delete
                            key = 'CLEAR';
                        } else if (event.keyCode === 8) { // Backspace
                            key = 'BACKSPACE';
                        }
                    }

                    self.payment_input(key);
                    event.preventDefault();
                };
            },


        next () {
            this.gui.show_screen('products');
        },
        back () {
            this.gui.back();
        },
        show () {
            this.set_weight(0);
            this.reset_input();
            this.renderElement();

            $('body').keypress(this.keyboard_handler);
            // that one comes from the pos, but we prefer to cover all the basis
            $('body').keydown(this.keyboard_keydown_handler);
            this._super(...arguments);
        },
        addprod (){
            this.gui.show_screen('products');
            this.order_product();
        },

        get_product: function(){
            return this.gui.get_current_screen_param('product');
        },
        _get_active_pricelist: function(){
            var current_order = this.pos.get_order();
            var current_pricelist = this.pos.default_pricelist;
            if (current_order) {
                current_pricelist = current_order.pricelist;
            }
            return current_pricelist;
        },
        order_product: function(){
            this.pos.get_order().add_product(this.get_product(),{ quantity: this.weight });
        },
        get_product_name: function(){
            var product = this.get_product();
            return (product ? product.display_name : undefined) || 'Unnamed Product';
        },
        get_product_price: function(){
            var product = this.get_product();
            var pricelist = this._get_active_pricelist();
            return (product ? product.get_price(pricelist, this.weight) : 0) || 0;
        },
        get_product_image_url: function(){
            var product = this.get_product();
            //var idprod = (product ? product.id: 0);
            return window.location.origin + '/web/image?model=product.product&field=image_128&id='+( product ? product.id: 0);
        },
        get_product_uom: function(){
            var product = this.get_product();
            if(product){
                return this.pos.units_by_id[product.uom_id[0]].name;
            }else{
                return '';
            }
        },
        set_weight: function(weight){
            this.weight = weight;
            //this.$('.weight').text(this.get_product_weight_string());
            this.$('.computed-price').text(this.get_computed_price_string());
        },
        reset_input: function(){
            //var line = this.pos.get_order().selected_paymentline;
            this.firstinput  = true;
            this.inputbuffer = "";
        },
        payment_input: function(input) {
            var newbuf = this.gui.numpad_input(this.inputbuffer, input, {'firstinput': this.firstinput});
            this.firstinput = (newbuf.length === 0);
            // popup block inputs to prevent sneak editing.
            if (this.gui.has_popup()) {
                return;
            }

            if (newbuf !== this.inputbuffer) {
                this.inputbuffer = newbuf;
                var weight_vals = this.inputbuffer;

                if (this.inputbuffer !== "-") {
                     weight_vals = field_utils.parse.float(this.inputbuffer);
                }
                this.$('input.weightmanual').val(this.format_currency_no_symbol(weight_vals));
                this.set_weight(weight_vals);
                }
            },

        get_computed_price_string: function(){
            return this.format_currency(this.get_product_price() * this.weight);
        },

        click_numpad: function(button) {
            this.payment_input(button.data('action'));
        },

        hide: function(){
            $('body').off('keypress', this.keyboard_handler);
            $('body').off('keydown', this.keyboard_keydown_handler);
            this._super();
        },
        render_numpad: function() {
            var self = this;
            var numpad = $(QWeb.render('PaymentScreen-Numpad', { widget:this }));
            numpad.on('click','button',function(){
                self.click_numpad($(this));
            });
            return numpad;
        },
        renderElement: function(){
            var self = this;
            this._super();

            //var numpad = this.render_numpad();
            //numpad.appendTo(this.$('.payment-numpad'));
        }
    });

    gui.define_screen({ name : 'ScaleManual', widget: ScaleManualWidget});

    screens.ProductScreenWidget.include({
        click_product: function (product) {
            var self = this;
            product = product || {}
            if(product.to_weight) {
                this.gui.show_screen("ScaleManual",{product: product});
            }else{
                this.pos.get_order().add_product(product);
            }
        },

    });


});