
$(document).ready(function(){
	
// customize the account signup form //

    showErrors = function(m){
        $('#exampleModalLabel').text('Please correct the following problems :');
        $('.modal .modal-body').html(m);
        $('#exampleModal').modal('show');
    }


showInvalidEmail = function()
{
    showErrors(['That email address is already in use.']);
}

showInvalidUserName = function()
{
    showErrors(['That username is already in use.']);
}

showInvalidPhone = function()
{
    showErrors(['That phone is already in use.']);
}

validateEmail = function(e) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(e);
}

validateForm = function(a) {
    let e = [];
    if ($('#user-tf').val() === '') { e.push('Please enter a username<br>'); }
    if ($('#pass-tf').val() === '') { e.push('Please enter a password<br>'); }
    if (!validateEmail($('#email-tf').val())) { e.push('Please enter an email address<br>'); }
    if ($('#phone-tf').val() === '') { e.push('Please enter a phone number'); }
    if (e.length) showErrors(e);
    return e.length === 0;
};

	$('#account-form-btn2').addClass('btn-primary');
	
// setup the alert that displays when an account is successfully created //
    $('#exampleModalLabel').text('Account Created!');
    $('.modal .modal-body').html('Your account has been created.</br>Click OK to return to the login page.');
    $('#account-form-btn2').click(function () {
        if(validateForm()) {
            $.post("signup", $('form#account-form').serialize(), function (data) {
                $('.modal-alert').modal('show');
            })
                .fail(function (e) {
                    if (e.responseText === 'email-taken') {
                        showInvalidEmail();
                    } else if (e.responseText === 'username-taken') {
                        showInvalidUserName();
                    } else if (e.responseText === 'phone-taken') {
                        showInvalidPhone();
                    }
                });
            $('#name-tf').focus();
        }
    });
    $('#account-form-btn1').click(function () {
        window.location.href = '/login';
    });
});
