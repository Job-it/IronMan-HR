import React from 'react';

const Login = (props) => {
  return (
      <div className = 'facebook-login'>     
        <div className = 'login-box'>
          <img className = 'facebook-login-logo' src = '/assets/fbpix.jpg'/>
          <a className ='login-text' href = '/auth/facebook'>
            Continue with Facebook
          </a>
        </div>   
      </div>


  )
}

export default Login;