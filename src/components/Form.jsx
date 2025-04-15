import React, {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";


function Form(){
    const generateRandomUserId = () => {
        return Math.floor(Math.random()*1000 + 1)
    }

    const formatVATNumber = (vat) => {
        const firstFour = vat.slice(0, 4);
        const lastFour = vat.slice(-4);
        const newVat = `${firstFour}-${lastFour}`;
        return newVat;
    }

    const passwordStrength = (password) => {
        let strength_of_paswd = 0;
        if(password.length >= 6) strength_of_paswd += 1;
        if(password.match(/[0-9]/)) strength_of_paswd += 1;
        if(password.match(/[A-Z]/)) strength_of_paswd += 1;
        if(password.match(/[`!@#$^*()_+\-={}:'"\\|,.<>/?~]/)) strength_of_paswd += 2;
        if(strength_of_paswd <= 2) return "Weak";
        if(strength_of_paswd <= 4) return "Moderate";
        if(strength_of_paswd <= 6) return "Strong";
        return "Very Strong";
    }

    const handleStartOver = () => {
        setSuccess(false);
        setUserId('');
        setErrors('');
        formikSignup.resetForm();
    };

    const showHidePassword = () =>{
        const passwordField = document.getElementById("password");
        if(passwordField.type === "password"){
            passwordField.type = "text";
        } else {
            passwordField.type = "password";
        }
    }

    const showHideConfPassword = () =>{
        const passwordField = document.getElementById("confPassword");
        if(passwordField.type === "password"){
            passwordField.type = "text";
        } else {
            passwordField.type = "password";
        }
    }

    const initialStates = {
        email: '',
        password: '',
        confPassword: '',
        full_name: '',
        age: '',
        tac: false,
        acc_type: '',
        company_name: '',
        business_email: '',
        vat_number: ''
    }
    const [success, setSuccess] = useState(false);
    const [userId, setUserId] = useState('');
    const [errors, setErrors] = useState('');
    const [userName, setUserName] = useState('');
    const [userData, setUserData] = useState([]);

    const common_domains = [ "gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "mail.com" ];
    const not_available_domain = ["yahooo.com", "gmaill.com", "coldmail.com", "mails.com"];

    const check_domain_avail = async (email) => {
        try{
            return new Promise((resolve) => {
                setTimeout(() => {
                    const domain_used = not_available_domain.some(domain => email.includes(domain));
                    if(!domain_used){
                        const msg = {
                            success: true,
                            message: "Thank you"
                        }
                        resolve(msg);
                    } else{
                        const msg = {
                            success: false,
                            message: "Domain Not Available"
                        }
                        resolve(msg);
                    }
                }, 2000)
            })
        } catch(error){
            console.log(error);
            return null;
        }
    }

    const mock_api_call = async () => {
        try{
            return new Promise((resolve) => {
                setTimeout(() => {
                    const user_id = generateRandomUserId();
                    setUserId(user_id);
                    resolve(user_id);
                }, 2000);
            })
        } catch(error){
            console.log(error);
            return null;
        }
    }

    const check_email = (email) => {
        if(email.includes("fail")) {
            return true;
        } else{
            return false;
        }
    }

    const check_temp_email = (email) => {
        const temp_email_domains = ["tempmail.com", "10minutemail.com", "tempmail.org", "insfou.com"];
        for(let domain of temp_email_domains){
            if(email.includes(domain)){
                return true;
            }
        }
        return false;
    }

    const validate = Yup.object({
            email: Yup.string().trim().email("Email address must be valid").required("Email ID is Required").test('fail', 'Email ID is not valid', (value) => !value.includes("fail")).test('temp', 'Temporary emails are not allowed', value => !check_temp_email(value)),
            full_name: Yup.string().trim().min(3, "Full Name must be minimum 3").required("Full name is required").matches(/^[a-zA-Z\s]*$/, 'Name must contain only letters and spaces'),
            password: Yup.string().trim().min(6, "Password must be minimum 6 characters").required("Password is Required").matches(/[0-9]/, "Password must contain at least one number").matches(/[A-Z]/, "Password must contain at least one uppercase letter").matches(/[`!@#$^*()_+\-={}:'"\\|,.<>/?~]/, "Password must contain at least one special character"),
            confPassword: Yup.string().trim().oneOf([Yup.ref('password'), null], "Password and Confirm Password Does not Match").required("Confirm Password is Required"),
            age: Yup.number().typeError("Age must be number").nullable(),
            tac: Yup.boolean().oneOf([true], "You must accept terms and conditions"),
            acc_type: Yup.string().required("Account Type is Required"),
            company_name: Yup.string().when('acc_type', {
                is: "business",
                then: () => Yup.string().required("Company Name is required"),
                otherwise: () => Yup.string().notRequired()
            }),
            business_email: Yup.string().when('acc_type', {
                is: "business",
                then: () => Yup.string().trim().email("Email address must be valid").notOneOf([Yup.ref('email'), null], "Company Email and Personal Email cannot be same").required("Business Email is Required"),
                otherwise: () => Yup.string().notRequired()
            }),
            vat_number: Yup.string().when('acc_type', {
                is: "business",
                then: () => Yup.string().min(9, "Minimum 8 characters").max(9, "Maximum").required("VAT Number is Required").matches(/^\d+-\d+$/, "VAT Number must contain only digits"),
                otherwise: () => Yup.string().notRequired()
            })
        });

        const formikSignup = useFormik({
            initialValues: initialStates,
            validationSchema: validate,
            onSubmit: async (values, {resetForm, setSubmitting}) => {
                try{
                    console.log("In submit function", values);
                    const msg = await check_domain_avail(values.email);
                    console.log(msg);
                    if(!msg.success){
                        alert(msg.message);
                        return;
                    }
                    else{
                        const resp = await mock_api_call();
                        console.log(resp);
                        const user_data = {
                            userId: resp,
                            email: values.email,
                            full_name: values.full_name,
                            age: values.age,
                            tac: values.tac,
                            acc_type: values.acc_type,
                            company_name: values.company_name,
                            business_email: values.business_email,
                            vat_number: values.vat_number
                        }
                        setUserName(values.full_name);
                        setUserData(user_data);
                        setSuccess(true);
                        resetForm();
                    }
                    
                } catch(error){
                    console.log(error);
                    setErrors(error || "Something Went Wrong");
                    setSuccess(false);
                } finally{
                    setSubmitting(false);
                }
            }
        })

    return(<>
        <div className="max-w-sm mx-auto dark:bg-gray-950 dark:text-white pb-5" style={{display: success ? "none" : "block"}}>
            <h2 className="mt-5 mb-5 text-center">Signup Form</h2>
            <form onSubmit={formikSignup.handleSubmit} noValidate onReset={formikSignup.handleReset} className="max-w-sm mx-auto border rounded-lg block p-12">
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">Full Name</label>
                    <input type="text" name="full_name" value={formikSignup.values.full_name} onChange={formikSignup.handleChange} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white focus:outline-2 ${formikSignup.touched.full_name && formikSignup.errors.full_name ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                    {formikSignup.touched.full_name && formikSignup.errors.full_name ? (
                                 <div className="error dark:bg-gray-950 text-red-500">{formikSignup.errors.full_name}</div>
                             ) : null}
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">Password</label>
                    <input type="password" name="password"  id="password" value={formikSignup.values.password} onChange={formikSignup.handleChange} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white ${formikSignup.touched.password && formikSignup.errors.password ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                    <button type="button" onClick={showHidePassword} className="text-sm text-white p-3 bg-blue-500 m-2 hover:scale-120">Show</button>
                    <span className="dark:bg-gray-950 dark:text-white">{passwordStrength(formikSignup.values.password)}</span>
                    {formikSignup.touched.password && formikSignup.errors.password ? (
                                 <div className="error dark:bg-gray-950 text-red-500">{formikSignup.errors.password}</div>
                             ) : null}
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">Confirm Password</label>
                    <input type="password" name="confPassword" id="confPassword" value={formikSignup.values.confPassword} onChange={formikSignup.handleChange} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white ${formikSignup.touched.confPassword && formikSignup.errors.confPassword ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                    <button type="button" onClick={showHideConfPassword} className="text-sm text-white p-3 bg-blue-500 m-2 hover:scale-120">Show</button>
                    {formikSignup.touched.confPassword && formikSignup.errors.confPassword && (
                                 <div className="error dark:bg-gray-950 text-red-500">{formikSignup.errors.confPassword}</div>
                             )}
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">Email ID</label>
                    <input type="email" name="email" value={formikSignup.values.email} onChange={formikSignup.handleChange} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white ${formikSignup.touched.email && formikSignup.errors.email ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                    {formikSignup.touched.email && formikSignup.errors.email ? (
                                 <div className="error dark:bg-gray-950 text-red-500">{formikSignup.errors.email}</div>
                             ) : null}
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">Age</label>
                    <input type="number" name="age" value={formikSignup.values.age} onChange={formikSignup.handleChange} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white ${formikSignup.touched.age && formikSignup.errors.age ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                    {formikSignup.touched.age && formikSignup.errors.age ? (
                                 <div className="error dark:bg-gray-950 text-red-500">{formikSignup.errors.age}</div>
                             ) : null}
                </div>
                <div className="flex items-start gap-2 dark:bg-gray-950 dark:text-white">
                    <input type="checkbox" name="tac" checked={formikSignup.values.tac}
                            onChange={formikSignup.handleChange}
                            onBlur={formikSignup.handleBlur} className={`dark:bg-white ${formikSignup.touched.tac && formikSignup.errors.tac ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}
                    />
                    <label className="dark:bg-gray-950 dark:text-white">Terms and Conditions</label>
                    {formikSignup.touched.tac && formikSignup.errors.tac ? (
                                 <div className="error dark:bg-gray-950 text-red-500">{formikSignup.errors.tac}</div>
                             ) : null}
                </div>

                <div className="mb-5">
                <label htmlFor="acc_type" className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">Account Type</label>
                    <select
                        id="acc_type"
                        name="acc_type"
                        onChange={formikSignup.handleChange}
                        onBlur={formikSignup.handleBlur}
                        value={formikSignup.values.acc_type}
                        className={`w-full border rounded px-3 py-2 ${formikSignup.touched.acc_type && formikSignup.errors.acc_type ? "border-red-500" : "border-gray-300"}`}
                    >
                        <option value="" className="dark:bg-gray-950 dark:text-white">Select Account Type</option>
                        <option value="personal" className="dark:bg-gray-950 dark:text-white">Personal</option>
                        <option value="business" className="dark:bg-gray-950 dark:text-white">Business</option>
                    </select>
                    {formikSignup.touched.acc_type && formikSignup.errors.acc_type ? (
                        <div className="text-red-500 text-sm">{formikSignup.errors.acc_type}</div>
                    ) : null}
                </div>
                
                <div className={`mb-5 ${formikSignup.values.acc_type === "business" ? "block" : "hidden"}`}>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">Company Name</label>
                        <input type="text" name="company_name" value={formikSignup.values.company_name} onChange={formikSignup.handleChange} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white ${formikSignup.touched.company_name && formikSignup.errors.company_name ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                        {formikSignup.touched.company_name && formikSignup.errors.company_name ? (
                                    <div className="error text-red-500">{formikSignup.errors.company_name}</div>
                                ) : null}
                    </div>

                    <div className="mb-5">
                    <label className={`block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white`}>Business Email ID</label>
                    <input type="email" name="business_email" value={formikSignup.values.business_email} onChange={(e) => {
                        const value = e.target.value;
                        const index = Math.floor(Math.random() * common_domains.length);
                        if(value.endsWith("@")){
                            const domain = common_domains[index];
                            formikSignup.setFieldValue("business_email", value + domain);
                        } else{
                            formikSignup.handleChange(e)
                        }
                    }} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white ${formikSignup.touched.business_email && formikSignup.errors.business_email ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                    {formikSignup.touched.business_email && formikSignup.errors.business_email ? (
                                 <div className="error text-red-500">{formikSignup.errors.business_email}</div>
                             ) : null}
                    </div>

                    <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:bg-gray-950 dark:text-white">VAT Number</label>
                    <input type="text" name="vat_number" value={formikSignup.values.vat_number} onChange={(e) => {
                        const value = e.target.value;
                        if(value.length < 8){
                            formikSignup.handleChange(e); 
                        } else {
                            formikSignup.setFieldValue("vat_number", formatVATNumber(value));
                        }
                    }} onBlur={formikSignup.handleBlur} className={`border text-gray-900 text-sm rounded-lg block w-50 p-2.5 dark:bg-white ${formikSignup.touched.business_email && formikSignup.errors.business_email ? "border-red-500" : "border-gray-300"} focus:scale-x-120`}/>
                    {formikSignup.touched.vat_number && formikSignup.errors.vat_number ? (
                                 <div className="error text-red-500">{formikSignup.errors.vat_number}</div>
                             ) : null}
                    </div>
                </div>

                <button type="submit" className="p-2 mr-4 rounded bg-blue-500 text-white disabled:opacity-50 hover:scale-120" disabled={Object.keys(formikSignup.errors).length > 0 || !formikSignup.dirty || formikSignup.isSubmitting || check_email(formikSignup.values.email) || check_temp_email(formikSignup.values.email) || check_email(formikSignup.values.business_email) || check_temp_email(formikSignup.values.business_email)}>
                    {formikSignup.isSubmitting ? "LOADING ...": "SIGNUP"}
                </button>
                <button type="reset" className="mt-4 p-2 bg-blue-500 text-white rounded hover:scale-120">Reset</button>
                {success && <span>SIGNUP SUCCESS !</span>}

            </form>
        </div>

            <div style={{display: success ? "block" : "none"}} className="max-w-sm mx-auto mt-5 mb-5 text-center h-screen">
                {errors && <div>
                    <span className="text-red-500">{errors}</span>
                </div> }

                {!errors && <div className="text-white bg-green-400 p-5 rounded-lg dark:bg-white dark:text-gray-950">
                    <h2 className="text-center">Signup Successful</h2>
                    <p className="text-sm">Welcome {userName}</p>
                    <p className="text-sm">Your User ID is: <span className="font-bold">{userId}</span></p>
                    <p className="text-sm">Successful Signup</p>
                    <p className="text-sm">User Name: {userData.full_name}</p>
                    <p className="text-sm">Email: {userData.email}</p>
                    <p className="text-sm">Account Type: {userData.acc_type}</p>
                    <p className="text-sm">Company Name: {userData.company_name}</p>
                    <p className="text-sm">Business Email: {userData.business_email}</p>
                    <button onClick={handleStartOver} className="mt-4 p-2 bg-blue-500 text-white rounded">Start Over</button>
                </div>}
            </div>
        </>
    );
}

export default Form;