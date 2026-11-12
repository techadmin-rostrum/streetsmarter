export function guideAnchor(file){
  const name=String(file||'').split('/').pop().replace(/\.pdf$/i,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
  return name?`guide-${name}`:''
}

const vote='/downloads/know-your-rights/How_to_Vote_Whom_to_Vote.pdf'
const police='/downloads/know-your-rights/Police_Station_Rights.pdf'
const rti='/downloads/know-your-rights/RTI_Right_to_Information.pdf'
const driving='/downloads/know-your-rights/Driving_Licence_Traffic_Rules.pdf'
const cheatsheet='/downloads/know-your-rights/Cheatsheet_Consumer_RTE_LocalGovt_JobRights.pdf'
const digital='/downloads/stay-safe/Digital_Safety.pdf'
const emergency='/downloads/stay-safe/Emergency_Response.pdf'
const scholarships='/downloads/know-your-schemes/Scholarships_Internships_Savings.pdf'
const documents='/downloads/know-your-schemes/Keeping_Documents_in_Place.pdf'
const digilocker='/downloads/know-your-schemes/DigiLocker.pdf'
const aadhaar='/downloads/know-your-schemes/Cheatsheet_Aadhaar_Correction.pdf'
const bank='/downloads/money-matters/Bank_Account_PAN_Card.pdf'
const loans='/downloads/money-matters/Loans_Credit_Score.pdf'
const taxes='/downloads/money-matters/Taxes_We_Pay.pdf'
const insurance='/downloads/money-matters/Types_of_Insurance.pdf'

export const AGES=[
  {age:14,line:'Class 9 is where the scholarship guides on this site start.',items:[
    {text:'Scholarships, internships and savings the guides already cover from Class 9.',file:scholarships},
    {text:'A short sheet on the RTE Act, consumer rights, local government and job rights.',file:cheatsheet},
    {text:'Passwords, privacy settings and what never to share online.',file:digital},
  ]},
  {age:16,line:'MY Bharat, already listed on Schemes, is open from 15 to 29.',items:[
    {text:'MY Bharat, the youth platform for ages 15–29.',to:'/schemes'},
    {text:'Who to call and what to do when something goes wrong.',file:emergency},
    {text:'What you can and cannot be asked to do at a police station.',file:police},
  ]},
  {age:17,line:'You can get the 18 paperwork started before the birthday.',items:[
    {text:'Register to vote if you are 18, or turning 18 within the qualifying period.',file:vote,to:'/blog/first-election-checklist'},
    {text:'A savings account with limited rights is already open to minors. Full rights start at 18.',file:bank},
  ]},
  {age:18,line:'Voting and a full bank account are the changes these guides are written for.',items:[
    {text:'Register to vote, check your booth, and read a candidate before election day.',file:vote,to:'/blog/first-election-checklist'},
    {text:'Open a bank account and apply for a PAN card. Full account rights start at 18.',file:bank},
    {text:'The paperwork every young adult should have sorted.',file:documents},
    {text:'Store official documents in DigiLocker.',file:digilocker},
    {text:'How to fix an error on an Aadhaar card.',file:aadhaar},
    {text:'Driving licence and traffic rules, in the guide.',file:driving},
    {text:'How to file an RTI and get a straight answer from a government office.',file:rti},
  ]},
  {age:21,line:'None of these guides starts a new legal right at 21. These are the ones you still use.',items:[
    {text:'Education loans and how a credit score works.',file:loans},
    {text:'The taxes that already touch everyday spending.',file:taxes},
    {text:'Job rights and minimum wage, on the rights sheet.',file:cheatsheet},
    {text:'Which kinds of insurance are worth having.',file:insurance},
  ]},
]
