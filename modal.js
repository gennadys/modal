/**
 *  Modal window
 *  https://github.com/gennadys/modal
 */
 
(function($) {
  var defaults = {
      url: false,
      opener: false,
      className: 'modal',
      content: '',
      data: {},
      scrollable: false,
      scrollbar: true,
      modal: true,
      overlay: true,
      opacity: 0.7,
      view: 'default',
      tools: true,
      gravity: false,
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      windowLocation: false,
      beforeShow: function(){}
  };

  var methods = {
    init: function(opener) {
      if (opener) this.opener = opener;
      if (this.url === false && this.content === '') this.url = this.opener.href || false;
      if (!this.opener) this.gravity = false;
      
      $(this.opener).addClass(this.className + '-active');

      if (this.$modal && this.$modal.is(':visible')) {
        this.remove();
      } else {
        this.create();
      }
    },
    
    success: function() {
      this.beforeShow();
      this.$modal.show();
      this.position();
    },
    
    position: function() {
      var $opener = $(this.opener),
          $parent = $opener.parent(),
          pos     = {},
          opener  = $.extend({}, $opener.offset(), {
                      width: $opener.outerWidth(),
                      height: Math.min($parent.height(), $opener.outerHeight())
                    }),
          modal   = {};
          
      this.$modal.addClass(this.className + '-' + this.gravity);
      
      modal = { width: this.$modal.outerWidth(), height: this.$modal.outerHeight() };
      
      if (this.gravity) {
        switch (this.gravity.charAt(0)) {
          case 's':
            pos = { top: opener.top + opener.height, left: opener.left + opener.width / 2 - modal.width / 2 };
            break;
          case 'n':
            pos = { top: opener.top - modal.height, left: opener.left + opener.width / 2 - modal.width / 2 };
            break;
          case 'w':
            pos = { top: opener.top + opener.height / 2 - modal.height / 2, left: opener.left - modal.width };
            break;
          case 'e':
            pos = { top: opener.top + opener.height / 2 - modal.height / 2, left: opener.left + opener.width };
            break;
          }
          
        if (this.gravity.length == 2) {
            if (this.gravity.charAt(1) == 'w') {
                pos.left = opener.left;
                
                this.$modal.find('div.' + this.className + '-spacer').css({ left: opener.width / 2 });
            } else {
                pos.left = opener.left + opener.width - modal.width;
                
                this.$modal.find('div.' + this.className + '-spacer').css({ right: opener.width / 2 });
            }
        }

        this.$modal.css(pos);
      }
    },

    create: function(){
      var self      = this,
          template  = '',
          $opener   = $(self.opener);

      if (self.gravity === false) {
        template =
          '<table class="modal modal-data ' + self.view + ( self.scrollable ? ' modal-scrollable' : '') + '">' +
            '<tr>' +
              '<td class="modal">' +
                '<table class="modal-wrapper">' +
                  '<tr>' +
                    '<td class="modal-wrapper">' +
                      '<div class="modal-window">' +
                        '<div>' +
                          '<div class="modal-tools">' +
                            '<a class="modal-close" href="#close">&times;</a>' +
                          '</div>' +
                          '<div class="modal-content partial"></div>' +
                        '</div>' +
                      '</div>' +
                    '</td>' +
                  '</tr>' +
                '</table>' +
              '</td>' +
            '</tr>' +
          '</table>';
      } else {
        template =
          '<div class="modal modal-data ' + self.view + '">' +
            '<div class="modal-spacer"></div>' +
            '<div class="modal-window">' +
              '<div>' +
                '<div class="modal-tools">' +
                  '<a class="modal-close" href="#close">&times;</a>' +
                '</div>' +
                '<div class="modal-content partial"></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      }
      
      self.$modal = $(template.split('modal').join(self.className)).hide();

      if (self.overlay) {
        self.$overlay = $('<div class="' + self.className + '-overlay"></div>');
        self.$overlay.css({ opacity:self.opacity }).appendTo('body');
      }
      
      self.$modal
        .appendTo('body')
        .data('modal', this);
      
      if (self.gravity === false && !self.scrollable) {
        self.$modal.css({ top: $(window).scrollTop() });
      } else {
        $(window).bind("resize.modal", function(){ self.position(); });
      }
      
      if (self.tools) self.$modal.find('div.' + self.className + '-tools').show();

      self.$window = self.$modal.find('table.' + self.className + '-window, div.' + self.className + '-window');
      self.$content = self.$modal.find('div.' + self.className + '-content');
      
      $(self.$modal)
        .on('click.modal-close', '.' + self.className + '-close', function(event){
          self.remove();
          event.preventDefault();
        })
        .on('click.modal-confirm', '.' + self.className + '-confirm', function(){
          $opener.data('confirmed', true);
          self.remove();
          $opener.click().data('confirmed', false);
          event.preventDefault();
          
          if (self.windowLocation === true) window.location.href = self.opener.href;
        });
      
      if (!self.modal) {
        self.docevnt = function(event){
          if (!($(self.opener).is(event.target) || self.$modal.is(event.target) || self.$modal.has(event.target).length)) {
            self.remove();
          }
        };
        $(document).on('click.modal-close', self.docevnt);
      }
      
      if (self.content !== '') {
        self.$content.html(self.content);
        self.success();
      } else if ($opener.data('confirm')) {
        self.$content.html(
          '<div class="' + self.className + '-message">' + $opener.data('confirm') + '</div>' +
          '<div class="' + self.className + '-actions">' +
            '<input type="button" value="' + self.confirmText + '" class="' + self.className + '-confirm">' +
            '<a href="#close" class="' + self.className + '-close">' + self.cancelText + '</a>' +
          '</div>'
        );
        self.success();
      } else if (self.url) {
        $.ajax({
          type: 'get',
          url: self.url,
          data: self.data,
          success: function(html) {
            self.$content.html(html);
            self.success();
          },
          error: function() {
            self.remove();
          }
        });
      } else {
        self.success();
      }
      
      if (!self.scrollbar) {
        $('html').css({ overflow: 'hidden' });
      }
    },

    remove: function() {
      this.$modal.remove();
      if (this.$overlay) this.$overlay.remove();

      $(this.opener).removeClass('modal-active');
      
      $('html').css({ overflow: 'auto' });
    }
  };
  
  $.modal = function(options) {
    var modal = $.extend({}, defaults, methods, options);
    
    modal.init();
    
    return modal;
  };

  $.fn.modal = function(options) {
    $(document).on('click.modal', this.selector, function(event) {
      var $this = $(this),
          modal = $this.data('modal');

      if ($this.data('confirmed') !== true) {
        if (!modal) {
          modal = $.extend({}, defaults, methods, options);
          $this.data('modal', modal);
        }
  
        modal.init(this);

        event.preventDefault();
      }
    });
    
    return this;
  };
})(jQuery);
