/**
 *  Modal window
 */
(function($) {
  var defaults = {
      url: false,
      opener: false,
      remote: true,
      content: '',
      data: {},
      scrollable: false,
      scrollbar: true,
      modal: true,
      overlay: true,
      opacity: 0.7,
      view: 'default',
      close: true,
      gravity: false
  };

  var methods = {
    init: function(opener) {
      if (opener) this.opener = opener;
      if (this.url === false && this.content === '') this.url = this.opener.href || false;
      if (!this.opener) this.gravity = false;
      $(this.opener).addClass('modal-active');

      if (this.$modal && this.$modal.is(':visible')) {
        this.remove();
      } else {
        this.create();
      }
    },
    
    success: function() {
      this.$modal.show();
      this.position();
    },
    
    position: function() {
      // TODO Add functionality for all ways
      var $opener = $(this.opener),
          $parent = $opener.parent(),
          pos     = {},
          opener  = $.extend({}, $opener.offset(), {
                      width: $opener.outerWidth(),
                      height: Math.min($parent.height(), $opener.outerHeight())
                    }),
          modal   = { width: this.$modal.outerWidth(), height: this.$modal.outerHeight() };
      
      if (this.gravity) {
        switch (this.gravity.charAt(0)) {
          case 'n':
            pos = { top: opener.top + opener.height, left: opener.left + opener.width / 2 - modal.width / 2 };
            break;
          case 's':
            pos = { top: opener.top, left: opener.left + opener.width / 2 };
            break;
          case 'e':
            pos = { top: opener.top + opener.height / 2, left: opener.left };
            break;
          case 'w':
            pos = { top: opener.top + opener.height / 2 - modal.height / 2, left: opener.left + opener.width };
            break;
          }
          
        if (this.gravity.length == 2) {
            if (this.gravity.charAt(1) == 'w') {
                pos.left = opener.left;
            } else {
                pos.left = opener.left + opener.width - modal.width;
                
                this.$modal.find('div.modal-spacer').css({ right: opener.width/2 });
            }
        }

        this.$modal.css(pos).addClass('modal-' + this.gravity);
      }
    },

    create: function(){
      var self = this;

      if (self.gravity === false) {
        self.$modal = $(
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
                          '<div class="modal-content container"></div>' +
                        '</div>' +
                      '</div>' +
                    '</td>' +
                  '</tr>' +
                '</table>' +
              '</td>' +
            '</tr>' +
          '</table>'
        ).hide();
      } else {
        self.$modal = $(
          '<div class="modal modal-data ' + self.view + '">' +
            '<div class="modal-spacer"></div>' +
            '<div class="modal-window">' +
              '<div>' +
                '<div class="modal-tools">' +
                  '<a class="modal-close" href="#close">&times;</a>' +
                '</div>' +
                '<div class="modal-content container"></div>' +
              '</div>' +
            '</div>' +
          '</div>'
        ).hide();
      }

      if (self.overlay) {
        self.$overlay = $('<div class="modal-overlay"></div>');
        self.$overlay.css({ opacity:self.opacity }).appendTo('body');
      }
      
      self.$modal
        .appendTo('body')
        .data('modal', this);
      
      if (self.gravity === false) {
        self.$modal.css({ top:$(window).scrollTop() });
      } else {
        $(window).bind("resize.modal", function(){ self.position(); });
      }
      
      if (self.close) self.$modal.find('a.modal-close').show();

      self.$window = self.$modal.find('table.modal-window, div.modal-window');
      self.$content = self.$modal.find('div.modal-content');
      
      $(self.$modal).on('click.modal', '.modal-close', function(event){
        self.remove();
        event.preventDefault();
      });
      
      if (!self.modal) {
        self.docevnt = function(event){
          if (!($(self.opener).is(event.target) || self.$modal.is(event.target) || self.$modal.has(event.target).length)) {
            self.remove();
          }
        };
        $(document).bind('click.modal', self.docevnt);
      }

      if (self.url && self.remote) {
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
        self.$content.html(self.content);
        self.success();
      }
      
      if (!self.scrollbar) {
        $('html').css({ overflow: 'hidden' });
      }
    },

    remove: function() {
      this.$modal.remove();
      this.$overlay.remove();

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
    var self = this;
    
    $(document).on('click.modal', self, function(event) {
      if (self[0] === event.target) {
        var $this = $(event.target),
            modal = $this.data('modal');
      
        if (!modal) {
          modal = $.extend({}, defaults, methods, options);
          $this.data('modal', modal);
        }
      
        modal.init(event.target);

        event.preventDefault();
      }
    });
    
    return this;
  };
})(jQuery);
