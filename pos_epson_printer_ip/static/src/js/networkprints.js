odoo.define('pos_epson_printer_ip.networkprints', function (require) {
"use strict";

var core = require('web.core');
var mixins = require('web.mixins');
var Session = require('web.Session');
var devices = require("point_of_sale.devices");
var Printer = require('pos_epson_printer_ip.epson_printers').Printer;

devices.ProxyDevice.include({
    init: function(parent,options){
        this.printer=false;
        this._super(parent, options);
    },
   connect: function(url){
        var self = this;
        this.connection = new Session(undefined,url, { use_cors: true});
        this.host = url;
        if (this.pos.config.iface_print_via_proxy) {
            this.connect_to_printer();
        }
        this.set_connection_status('connecting',{});

        return this.message('handshake').then(function(response){
                if(response){
                    self.set_connection_status('connected');
                    localStorage.hw_proxy_url = url;
                    self.keepalive();
                }else{
                    self.set_connection_status('disconnected');
                    console.error('Connection refused by the Proxy');
                }
            },function(){
                self.set_connection_status('disconnected');
                console.error('Could not connect to the Proxy');
            }
        );
   },

   connect_to_printer: function () {
        this.printer = new Printer(this.host, this.pos);
   },
   autoconnect: function (options) {
        var self = this;
        this.set_connection_status('connecting',{});
        if (this.pos.config.iface_print_via_proxy) {
            this.connect_to_printer();
        }
        var found_url = new Promise(function () {});

        if (options.force_ip) {
            // if the ip is forced by server config, bailout on fail
            found_url = this.try_hard_to_connect(options.force_ip, options);
        } else if (localStorage.hw_proxy_url) {
            // try harder when we remember a good proxy url
            found_url = this.try_hard_to_connect(localStorage.hw_proxy_url, options)
                .catch(function () {
                    if (window.location.protocol != 'https:') {
                        return self.find_proxy(options);
                    }
                });
        } else {
            // just find something quick
            if (window.location.protocol != 'https:'){
                found_url = this.find_proxy(options);
            }
        }

        var successProm = found_url.then(function (url) {
            return self.connect(url);
        });

        successProm.catch(function () {
            self.set_connection_status('disconnected');
        });

        return successProm;
   },

});

});