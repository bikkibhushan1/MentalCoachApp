export default {
  COACHING_APP: {
    // id: "4",
    // swasthApp: "AC",
    appName: 'Coaching App',
    graphql: {
      dev:
        'https://adohqzdg7vajjjyeqsmva7oqla.appsync-api.us-east-1.amazonaws.com/graphql',
      prod:
        'https://6bzscxb2mbfobos7qqode5m3e4.appsync-api.us-east-1.amazonaws.com/graphql',
    },
    privacyPolicy: 'https://www.swasth.co/privacy',
    tnc: 'https://www.swasth.co/terms',
    support:
      'mailto:apps-help@swasth.co?subject=Question regarding Life Coach App',
    review: 'mailto:apps-help@swasth.co?subject=Coaching App Review',
    appStoreLink: 'itms-apps://itunes.apple.com/app/act-icoach/id1449444733',
    playStoreLink: `market://details?id=co.swasth.actcoach`,
    usersGroupClient: 'coaching-app-users',
    usersGroupCoach: 'coaching-app-coaches',
    s3BucketPrefix: 'coaching-app/',
    aboutContent:
      '<p>Acceptance and commitment therapy (ACT) is an action-oriented approach to psychotherapy that stems from traditional behavior therapy and cognitive behavioral therapy. Clients learn to stop avoiding, denying, and struggling with their inner emotions and, instead, accept that these deeper feelings are appropriate responses to certain situations that should not prevent them from moving forward in their lives. With this understanding, clients begin to accept their issues and hardships and commit to making necessary changes in their behavior, regardless of what is going on in their lives, and how they feel about it.</p> <div class="reference__section section section--title-separator"> <div class="row d-flex flex-column-reverse flex-md-row"> <div class="col-md-9 reference__section--main"> <h2 class="section__title"> </h2> <h3 class="section__title">How It Works</h3> <p>The theory behind ACT is that it is not only ineffective, but often counterproductive, to try to control painful emotions or psychological experiences, because suppression of these feelings ultimately leads to more distress. ACT adopts the view that there are valid alternatives to trying to change the way you think, and these include mindful behavior, attention to personal values, and commitment to action. By taking steps to change their behavior while, at the same time, learning to accept their psychological experiences, clients can eventually change their attitude and emotional state.</p> </div> </div> </div> <div class="reference__section section section--title-separator"> <div class="row d-flex flex-column-reverse flex-md-row"> <div class="col-md-3 mt-0 section--height-fix"> </div> <div class="col-md-9 reference__section--main"> <h3 class="section__title">What to Look for in an Acceptance and Commitment Therapist</h3> <p>Look for a licensed, experienced therapist, social worker, professional counselor or other mental-health professional with additional training in ACT. There is no special certification for ACT practitioners. Skills are acquired through peer counseling, workshops, and other training programs. In addition to these credentials, it is important to find a therapist with whom you feel comfortable working.</p> </div> </div> </div>',
    youtubeAPIKey: 'AIzaSyAhsyzyamCHUkWFBo0C497B5NOlnpSWy20',
    stripe: {
      client_id: {
        dev: 'ca_Gjwb3HIFbQ0JARCDXAKgqWBSGIUSkaEv',
        prod: 'ca_GjwbWyEtnlFcjyfP5KvKQUmT2Kgr2rCx',
      },
      publishable_key: {
        dev: 'pk_test_6YhcGKnClkNXYmjH1L1cLWWh00jRkf50I3',
        prod: 'pk_live_tXImwUFMU3c9QDLFT42949F000hlTn9GFH',
      },
    },
    pinpoint: {
      dev: '772c0087477a4a1fa13f4b29faec381d',
      prod: '',
    },
  },
};
