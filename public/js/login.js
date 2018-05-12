
$(document).ready(function(){

    function LoginValidator()
    {
// bind a simple alert window to this controller to display any errors //
        this.showLoginError = function(t, m)
        {
            $('#exampleModalLabel').text(t);
            $('.modal .modal-body').html(m);
            $('#exampleModal').modal('show');
        }
    }

    LoginValidator.prototype.validateForm = function()
    {
        if ($('#user-tf').val() === ''){
            this.showLoginError('Whoops!', 'Please enter a valid username');
            return false;
        }	else if ($('#pass-tf').val() === ''){
            this.showLoginError('Whoops!', 'Please enter a valid password');
            return false;
        }	else{
            return true;
        }
    }

    function LoginController()
    {
// bind event listeners to button clicks //
        $('#retrieve-password-submit').click(function(){ $('#get-credentials-form').submit();});
        $('#login #forgot-password').click(function(){
            $('#cancel').html('Cancel');
            $('#retrieve-password-submit').show();
            $('#get-credentials').modal('show');
        });
        $('#login .button-rememember-me').click(function(e) {
            var span = $(this).find('span');
            if (span.hasClass('glyphicon-unchecked')){
                span.addClass('glyphicon-ok');
                span.removeClass('glyphicon-unchecked');
            }	else{
                span.removeClass('glyphicon-ok');
                span.addClass('glyphicon-unchecked');
            }
        });

// automatically toggle focus between the email modal window and the login form //
        $('#get-credentials').on('shown.bs.modal', function(){ $('#email-tf').focus(); });
        $('#get-credentials').on('hidden.bs.modal', function(){ $('#user-tf').focus(); });
    }

	var lv = new LoginValidator();

// main login form //
    $('#suibian').click(function () {
        if(lv.validateForm()) {
            $.post("login", $('form#form-login').serialize(), function (data) {
                window.location.href = '/index';
            })
                .fail(function (e) {
                    lv.showLoginError('Login Failure', 'Please check your username and/or password');
                })
            $('#user-tf').focus();
        }
    })
	
});
