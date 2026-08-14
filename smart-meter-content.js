// smart-meter-content.js — every translatable string on /smart-meter/ and its twins.
//
// The page used to be hand-authored English-only. Moving the copy here lets generate-seo.js
// render /smart-meter/ plus /hi/, /mr/ and /ta/ twins from one source, which is how the rest
// of the site does vernacular — the alternative was maintaining four near-identical HTML
// files by hand and watching them drift.
//
// What is NOT translated, deliberately: the markings on the meter casing (see
// smart-meter-svg.js). Those are what is printed on a real Indian meter — "AC STATIC WATTHOUR
// SMART METER", "Scroll", the IS number. Translating them would make the diagram less
// faithful, and a reader holding the real device would stop being able to match it up.
// Register codes (1.8.0, 9.8.0) are international and stay as they are for the same reason.

export const SMG = {
  title: {
    en: 'Smart Meter Guide: Display Symbols, Register Codes & AMISP List',
    hi: 'स्मार्ट मीटर गाइड: डिस्प्ले के चिह्न, रजिस्टर कोड और AMISP सूची',
    mr: 'स्मार्ट मीटर मार्गदर्शक: डिस्प्ले चिन्हे, रजिस्टर कोड आणि AMISP यादी',
    ta: 'ஸ்மார்ட் மீட்டர் வழிகாட்டி: டிஸ்ப்ளே சின்னங்கள், ரெஜிஸ்டர் குறியீடுகள்',
  },
  description: {
    en: 'What every symbol on an Indian prepaid smart meter means — signal, tamper, relay and low-balance icons, OBIS register codes and the pulse LED.',
    hi: 'प्रीपेड स्मार्ट मीटर के हर चिह्न का मतलब — सिग्नल, टैम्पर, रिले और कम-बैलेंस के आइकन, OBIS रजिस्टर कोड और पल्स LED।',
    mr: 'प्रीपेड स्मार्ट मीटरवरील प्रत्येक चिन्हाचा अर्थ — सिग्नल, टॅम्पर, रिले आणि कमी-बॅलन्स आयकॉन, OBIS रजिस्टर कोड आणि पल्स LED.',
    ta: 'ப்ரீபெய்டு ஸ்மார்ட் மீட்டரின் ஒவ்வொரு சின்னத்தின் பொருள் — சிக்னல், டேம்பர், ரிலே, குறைந்த-பேலன்ஸ் ஐகான்கள், OBIS குறியீடுகள்.',
  },
  crumb: {
    en: 'Smart Meter Guide', hi: 'स्मार्ट मीटर गाइड',
    mr: 'स्मार्ट मीटर मार्गदर्शक', ta: 'ஸ்மார்ட் மீட்டர் வழிகாட்டி',
  },
  h1: {
    en: 'Smart Meter Guide: What Every Symbol Means',
    hi: 'स्मार्ट मीटर गाइड: हर चिह्न का क्या मतलब है',
    mr: 'स्मार्ट मीटर मार्गदर्शक: प्रत्येक चिन्हाचा अर्थ काय',
    ta: 'ஸ்மார்ட் மீட்டர் வழிகாட்டி: ஒவ்வொரு சின்னத்தின் பொருள்',
  },
  meta: {
    en: 'Updated %DATE% · Checked against <strong>IS 16444</strong> and <strong>IEC 62056-61</strong> · <a href="%PFX%/methodology/">How we source and verify</a>',
    hi: 'अपडेट %DATE% · <strong>IS 16444</strong> और <strong>IEC 62056-61</strong> के अनुसार जाँचा गया · <a href="%PFX%/methodology/">हमारी पद्धति</a>',
    mr: 'अद्ययावत %DATE% · <strong>IS 16444</strong> आणि <strong>IEC 62056-61</strong> नुसार तपासले · <a href="%PFX%/methodology/">आमची कार्यपद्धती</a>',
    ta: 'புதுப்பிப்பு %DATE% · <strong>IS 16444</strong> மற்றும் <strong>IEC 62056-61</strong> படி சரிபார்க்கப்பட்டது · <a href="%PFX%/methodology/">எங்கள் முறை</a>',
  },
  lead: {
    en: `Your prepaid smart meter cycles through a dozen numbers and a row of small symbols, and
         almost none of them are labelled. This page maps every element on a typical Indian
         single-phase smart meter — what each icon means, which reading is your actual
         consumption, and which ones mean you should act.`,
    hi: `आपका प्रीपेड स्मार्ट मीटर एक के बाद एक कई संख्याएँ और छोटे-छोटे चिह्न दिखाता रहता है, और उनमें से
         लगभग किसी पर कोई लेबल नहीं होता। यह पेज एक सामान्य भारतीय सिंगल-फेज़ स्मार्ट मीटर के हर हिस्से को
         समझाता है — हर आइकन का मतलब, कौन-सी रीडिंग असल में आपकी खपत है, और कौन-से चिह्न देखकर आपको
         कदम उठाना चाहिए।`,
    mr: `तुमचा प्रीपेड स्मार्ट मीटर एकापाठोपाठ अनेक आकडे आणि छोटी चिन्हे दाखवत राहतो, आणि त्यांपैकी जवळपास
         कशावरही लेबल नसते. हे पान एका सामान्य भारतीय सिंगल-फेज स्मार्ट मीटरवरील प्रत्येक घटक समजावते —
         प्रत्येक आयकॉनचा अर्थ, कोणते रीडिंग खरोखर तुमचा वापर आहे, आणि कोणती चिन्हे दिसल्यावर तुम्ही
         कृती करायला हवी.`,
    ta: `உங்கள் ப்ரீபெய்டு ஸ்மார்ட் மீட்டர் ஒன்றன்பின் ஒன்றாக பல எண்களையும் சிறிய சின்னங்களையும் காட்டிக்
         கொண்டே இருக்கும், அவற்றில் எதற்கும் விளக்கம் இருக்காது. இந்தப் பக்கம் ஒரு வழக்கமான இந்திய
         சிங்கிள்-ஃபேஸ் ஸ்மார்ட் மீட்டரின் ஒவ்வொரு பகுதியையும் விளக்குகிறது — ஒவ்வொரு ஐகானின் பொருள்,
         எந்த ரீடிங் உண்மையில் உங்கள் நுகர்வு, எந்தச் சின்னங்கள் தென்பட்டால் நீங்கள் நடவடிக்கை
         எடுக்க வேண்டும் என்பது.`,
  },
  toc: {
    label: { en: 'On this page', hi: 'इस पेज पर', mr: 'या पानावर', ta: 'இந்தப் பக்கத்தில்' },
    symbols: { en: 'Symbols on the display', hi: 'डिस्प्ले के चिह्न', mr: 'डिस्प्लेवरील चिन्हे', ta: 'டிஸ்ப்ளே சின்னங்கள்' },
    codes: { en: 'Register codes', hi: 'रजिस्टर कोड', mr: 'रजिस्टर कोड', ta: 'ரெஜிஸ்டர் குறியீடுகள்' },
    three: { en: 'Three-phase meters', hi: 'थ्री-फेज़ मीटर', mr: 'थ्री-फेज मीटर', ta: 'த்ரீ-ஃபேஸ் மீட்டர்' },
    amisp: { en: 'Who installed my meter', hi: 'मीटर किसने लगाया', mr: 'मीटर कोणी बसवले', ta: 'யார் மீட்டரை நிறுவினார்' },
    faq: { en: 'Common questions', hi: 'आम सवाल', mr: 'सामान्य प्रश्न', ta: 'பொதுவான கேள்விகள்' },
  },

  // ── the diagram ───────────────────────────────────────────────────────────
  symbolsH2: {
    en: 'The meter face, labelled', hi: 'मीटर का चेहरा, लेबल के साथ',
    mr: 'मीटरचा दर्शनी भाग, लेबलसह', ta: 'மீட்டர் முகப்பு, விளக்கத்துடன்',
  },
  symbolsIntro: {
    en: `Numbers on the diagram match the legend underneath. Not every meter shows every symbol,
         and the order the readings cycle in varies by manufacturer — but the elements themselves
         are common to meters built to <strong>IS 16444</strong>, the Indian standard for prepaid
         smart meters.`,
    hi: `चित्र पर दिए नंबर नीचे दी गई सूची से मेल खाते हैं। हर मीटर पर हर चिह्न नहीं होता, और रीडिंग किस
         क्रम में बदलती है यह कंपनी पर निर्भर करता है — लेकिन ये सभी हिस्से <strong>IS 16444</strong>
         (प्रीपेड स्मार्ट मीटर का भारतीय मानक) के अनुसार बने हर मीटर में समान होते हैं।`,
    mr: `चित्रावरील क्रमांक खालील यादीशी जुळतात. प्रत्येक मीटरवर प्रत्येक चिन्ह नसते, आणि रीडिंग कोणत्या
         क्रमाने बदलतात हे कंपनीनुसार बदलते — पण हे घटक <strong>IS 16444</strong> (प्रीपेड स्मार्ट
         मीटरचे भारतीय मानक) नुसार बनवलेल्या प्रत्येक मीटरमध्ये सारखेच असतात.`,
    ta: `படத்தில் உள்ள எண்கள் கீழே உள்ள பட்டியலுடன் பொருந்தும். ஒவ்வொரு மீட்டரிலும் எல்லாச் சின்னங்களும்
         இருக்காது, ரீடிங்குகள் மாறும் வரிசையும் நிறுவனத்தைப் பொறுத்து மாறும் — ஆனால் இந்தப் பகுதிகள்
         <strong>IS 16444</strong> தரப்படி கட்டப்பட்ட எல்லா மீட்டரிலும் ஒன்றுதான்.`,
  },
  hintTag: { en: 'Interactive', hi: 'इंटरैक्टिव', mr: 'इंटरॲक्टिव्ह', ta: 'ஊடாடும்' },
  hint: {
    en: `Press the <strong>Scroll</strong> button on the meter — or tap the display — to step
         through the readings, exactly as the real one does.`,
    hi: `मीटर पर <strong>Scroll</strong> बटन दबाइए — या डिस्प्ले पर टैप कीजिए — और रीडिंग एक-एक करके
         बदलती देखिए, ठीक जैसे असली मीटर में होता है।`,
    mr: `मीटरवरील <strong>Scroll</strong> बटण दाबा — किंवा डिस्प्लेवर टॅप करा — आणि रीडिंग एकेक करून
         बदलताना पाहा, अगदी खऱ्या मीटरसारखे.`,
    ta: `மீட்டரில் உள்ள <strong>Scroll</strong> பொத்தானை அழுத்துங்கள் — அல்லது டிஸ்ப்ளேயைத் தட்டுங்கள் —
         உண்மையான மீட்டரைப் போலவே ரீடிங்குகள் ஒவ்வொன்றாக மாறும்.`,
  },
  pressHere: { en: 'Press here', hi: 'यहाँ दबाएँ', mr: 'येथे दाबा', ta: 'இங்கே அழுத்தவும்' },
  figcaption: {
    en: `An interactive composite — press <strong>Scroll</strong> on the meter (or the button
         above) to step through the display cycle. A real meter never lights every indicator at
         once; layout and icon shapes vary by manufacturer, the meanings do not.`,
    hi: `यह एक संयुक्त चित्र है — मीटर पर <strong>Scroll</strong> (या ऊपर दिया बटन) दबाकर डिस्प्ले का
         पूरा चक्र देखिए। असली मीटर में सारे संकेत एक साथ कभी नहीं जलते; बनावट और आइकन कंपनी के अनुसार
         बदलते हैं, अर्थ नहीं बदलते।`,
    mr: `हे एकत्रित चित्र आहे — मीटरवरील <strong>Scroll</strong> (किंवा वरील बटण) दाबून डिस्प्लेचे संपूर्ण
         चक्र पाहा. खऱ्या मीटरमध्ये सर्व संकेत एकाच वेळी कधीच उजळत नाहीत; रचना आणि आयकॉन कंपनीनुसार
         बदलतात, अर्थ बदलत नाहीत.`,
    ta: `இது ஒரு தொகுப்புப் படம் — மீட்டரில் <strong>Scroll</strong> (அல்லது மேலே உள்ள பொத்தான்)
         அழுத்தி முழு டிஸ்ப்ளே சுழற்சியையும் பாருங்கள். உண்மையான மீட்டரில் எல்லா குறியீடுகளும் ஒரே
         நேரத்தில் எரிவதில்லை; வடிவமைப்பு நிறுவனத்துக்கேற்ப மாறும், பொருள் மாறாது.`,
  },

  // Fourteen callouts, in diagram order (top to bottom down the device).
  legend: [
    { t: { en: 'COM lamp', hi: 'COM लैंप', mr: 'COM दिवा', ta: 'COM விளக்கு' },
      d: { en: `communication activity. It blinks when the meter talks to the utility's network,
                which is occasional rather than constant: most meters report in bursts every 15 to
                30 minutes, not continuously. A COM lamp that never lights at all suggests the
                communication module is not reaching the network, which is what delays a recharge
                from landing. It is not related to your supply.`,
           hi: `संचार गतिविधि। जब मीटर बिजली कंपनी के नेटवर्क से बात करता है तब यह जलता है — लगातार नहीं,
                बल्कि थोड़े-थोड़े अंतराल पर: ज़्यादातर मीटर हर 15 से 30 मिनट में डेटा भेजते हैं। अगर COM लैंप
                कभी जलता ही नहीं, तो शायद कम्युनिकेशन मॉड्यूल नेटवर्क तक नहीं पहुँच रहा — रिचार्ज देर से
                पहुँचने की यही सबसे आम वजह है। इसका आपकी बिजली सप्लाई से कोई संबंध नहीं।`,
           mr: `संवाद क्रिया. मीटर वीज कंपनीच्या नेटवर्कशी बोलतो तेव्हा हा दिवा लुकलुकतो — सतत नाही, तर
                ठराविक अंतराने: बहुतेक मीटर दर 15 ते 30 मिनिटांनी डेटा पाठवतात. COM दिवा कधीच उजळत नसेल
                तर कम्युनिकेशन मॉड्यूल नेटवर्कपर्यंत पोहोचत नसावे — रिचार्ज उशिरा पोहोचण्याचे हेच मुख्य
                कारण. याचा तुमच्या वीजपुरवठ्याशी संबंध नाही.`,
           ta: `தொடர்பு செயல்பாடு. மீட்டர் மின் நிறுவனத்தின் நெட்வொர்க்குடன் பேசும்போது இது சிமிட்டும் —
                தொடர்ச்சியாக அல்ல, இடைவெளியில்: பெரும்பாலான மீட்டர்கள் 15 முதல் 30 நிமிடங்களுக்கு ஒருமுறை
                தரவை அனுப்பும். COM விளக்கு ஒருபோதும் எரியவில்லை என்றால், தொடர்பு தொகுதி நெட்வொர்க்கை
                அடையவில்லை என்று பொருள் — ரீசார்ஜ் தாமதமாக வருவதற்கு இதுவே பொதுவான காரணம். இது உங்கள்
                மின் விநியோகத்துடன் தொடர்புடையது அல்ல.` } },

    { t: { en: 'ON lamp', hi: 'ON लैंप', mr: 'ON दिवा', ta: 'ON விளக்கு' },
      d: { en: `supply present at the meter's terminals. Steady means power is reaching you. This is
                the fastest way to tell a local problem from a network one: if the ON lamp is lit
                but you have no power, the fault is on your side of the meter — your MCB, your
                wiring, your board — and not a DISCOM outage.`,
           hi: `मीटर के टर्मिनल तक बिजली पहुँच रही है। लगातार जलता रहे तो बिजली आ रही है। यह पता लगाने का
                सबसे तेज़ तरीका है कि दिक्कत आपके घर की है या नेटवर्क की: अगर ON लैंप जल रहा है फिर भी
                बिजली नहीं है, तो खराबी मीटर के बाद आपकी तरफ है — MCB, वायरिंग या बोर्ड में — डिस्कॉम की
                कटौती नहीं।`,
           mr: `मीटरच्या टर्मिनलपर्यंत वीज पोहोचत आहे. सतत उजळत असेल तर वीज येत आहे. अडचण तुमच्या घरातली
                आहे की नेटवर्कची, हे ओळखण्याचा हा सर्वात जलद मार्ग: ON दिवा उजळत असूनही वीज नसेल, तर बिघाड
                मीटरनंतर तुमच्या बाजूला आहे — MCB, वायरिंग किंवा बोर्डमध्ये — डिस्कॉमचा खंड नाही.`,
           ta: `மீட்டரின் டெர்மினல் வரை மின்சாரம் வந்துள்ளது. நிலையாக எரிந்தால் மின்சாரம் வருகிறது.
                பிரச்சினை உங்கள் வீட்டிலா நெட்வொர்க்கிலா என்பதை அறிய இதுவே விரைவான வழி: ON விளக்கு
                எரிந்தும் மின்சாரம் இல்லையென்றால், கோளாறு மீட்டருக்குப் பின் உங்கள் பக்கம் — MCB, வயரிங்
                அல்லது போர்டில் — DISCOM துண்டிப்பு அல்ல.` } },

    { t: { en: 'Network signal', hi: 'नेटवर्क सिग्नल', mr: 'नेटवर्क सिग्नल', ta: 'நெட்வொர்க் சிக்னல்' },
      d: { en: `the meter's link to the utility (RF mesh, or a cellular/NIC module). Weak or empty
                bars mean readings and recharges reach the meter late. Your balance still decrements
                normally; it is the <em>reporting</em> that lags, which is the usual reason a paid
                recharge appears to vanish.`,
           hi: `बिजली कंपनी से मीटर का संपर्क (RF मेश या सेल्युलर/NIC मॉड्यूल)। सिग्नल कमज़ोर या खाली हो तो
                रीडिंग और रिचार्ज मीटर तक देर से पहुँचते हैं। आपका बैलेंस सामान्य रूप से घटता रहता है; देर
                सिर्फ़ <em>रिपोर्टिंग</em> में होती है — इसी वजह से भरा हुआ रिचार्ज गायब लगता है।`,
           mr: `वीज कंपनीशी मीटरचा संपर्क (RF मेश किंवा सेल्युलर/NIC मॉड्यूल). सिग्नल कमकुवत किंवा रिकामे
                असल्यास रीडिंग आणि रिचार्ज मीटरपर्यंत उशिरा पोहोचतात. तुमचा बॅलन्स नेहमीप्रमाणे कमी होत
                राहतो; उशीर फक्त <em>अहवाल</em> देण्यात होतो — म्हणूनच भरलेला रिचार्ज गायब वाटतो.`,
           ta: `மின் நிறுவனத்துடன் மீட்டரின் இணைப்பு (RF மெஷ் அல்லது செல்லுலார்/NIC தொகுதி). சிக்னல்
                பலவீனமாக இருந்தால் ரீடிங்கும் ரீசார்ஜும் தாமதமாக மீட்டரை அடையும். உங்கள் பேலன்ஸ்
                வழக்கம்போல் குறைந்துகொண்டே இருக்கும்; தாமதம் <em>அறிக்கையிடலில்</em> மட்டுமே — செலுத்திய
                ரீசார்ஜ் மறைந்ததுபோல் தோன்றுவதற்கு இதுவே காரணம்.` } },

    { t: { en: 'Tamper / magnet flag', hi: 'टैम्पर / मैग्नेट संकेत', mr: 'टॅम्पर / मॅग्नेट संकेत', ta: 'டேம்பர் / காந்த எச்சரிக்கை' },
      d: { en: `set when the meter detects a strong external magnetic field, a removed terminal
                cover, or a reversed connection. It is logged with a timestamp and reported to the
                DISCOM. If it appears without anyone touching the meter, raise a complaint quickly —
                the log is the evidence, and it is easier to contest early.`,
           hi: `तब चालू होता है जब मीटर को बाहर से तेज़ चुंबकीय क्षेत्र, टर्मिनल कवर हटाया जाना, या उल्टा
                कनेक्शन मिलता है। यह समय के साथ दर्ज होकर डिस्कॉम तक पहुँचता है। अगर किसी ने मीटर को छुआ
                भी न हो और यह दिखे, तो तुरंत शिकायत कीजिए — यही रिकॉर्ड सबूत है, और शुरू में चुनौती देना
                आसान होता है।`,
           mr: `मीटरला बाहेरून तीव्र चुंबकीय क्षेत्र, काढलेले टर्मिनल कव्हर किंवा उलटे कनेक्शन आढळल्यास हे
                चालू होते. वेळेसह नोंद होऊन डिस्कॉमपर्यंत पोहोचते. कोणी मीटरला हातही लावला नसताना हे दिसले
                तर लगेच तक्रार करा — तीच नोंद पुरावा असते, आणि सुरुवातीलाच आव्हान देणे सोपे असते.`,
           ta: `வெளியில் இருந்து வலுவான காந்தப் புலம், அகற்றப்பட்ட டெர்மினல் மூடி, அல்லது தலைகீழ் இணைப்பு
                கண்டறியப்பட்டால் இது இயங்கும். நேரத்துடன் பதிவாகி DISCOM-க்கு அனுப்பப்படும். யாரும்
                மீட்டரைத் தொடாமலேயே இது தோன்றினால் உடனே புகார் அளியுங்கள் — அந்தப் பதிவே ஆதாரம்,
                ஆரம்பத்திலேயே எதிர்ப்பது எளிது.` } },

    { t: { en: 'Supply / relay status', hi: 'सप्लाई / रिले स्थिति', mr: 'पुरवठा / रिले स्थिती', ta: 'விநியோகம் / ரிலே நிலை' },
      d: { en: `whether the internal disconnect switch is closed (supply on) or open. An open relay
                with credit still on the meter usually means a remote disconnection or a load-limit
                trip, not a fault.`,
           hi: `अंदर लगा डिस्कनेक्ट स्विच बंद है (सप्लाई चालू) या खुला। मीटर में बैलेंस होते हुए भी रिले खुला
                हो, तो आम तौर पर यह दूर से की गई कटौती या लोड-लिमिट ट्रिप है, कोई खराबी नहीं।`,
           mr: `आतील डिस्कनेक्ट स्विच बंद आहे (पुरवठा चालू) की उघडा. मीटरमध्ये बॅलन्स असूनही रिले उघडा असेल,
                तर सहसा तो दूरवरून केलेला खंड किंवा लोड-लिमिट ट्रिप असतो, बिघाड नव्हे.`,
           ta: `உள்ளே உள்ள துண்டிப்பு சுவிட்ச் மூடியுள்ளதா (விநியோகம் இயக்கம்) அல்லது திறந்துள்ளதா.
                மீட்டரில் பணம் இருந்தும் ரிலே திறந்திருந்தால், அது பொதுவாக தொலைவிலிருந்து செய்யப்பட்ட
                துண்டிப்பு அல்லது லோட்-லிமிட் டிரிப், கோளாறு அல்ல.` } },

    { t: { en: 'Low-balance alert', hi: 'कम-बैलेंस चेतावनी', mr: 'कमी-बॅलन्स इशारा', ta: 'குறைந்த-பேலன்ஸ் எச்சரிக்கை' },
      d: { en: `lights once your prepaid balance falls under the DISCOM's threshold. Most Indian
                DISCOMs then allow a short grace or emergency credit before the relay opens, and
                will not disconnect during notified night hours or on holidays.`,
           hi: `जब प्रीपेड बैलेंस डिस्कॉम की तय सीमा से नीचे चला जाता है तब यह जलता है। ज़्यादातर भारतीय
                डिस्कॉम इसके बाद थोड़ी मोहलत या इमरजेंसी क्रेडिट देते हैं, और अधिसूचित रात के घंटों या
                छुट्टी के दिन कनेक्शन नहीं काटते।`,
           mr: `प्रीपेड बॅलन्स डिस्कॉमच्या ठरलेल्या मर्यादेखाली गेल्यावर हा उजळतो. बहुतेक भारतीय डिस्कॉम
                त्यानंतर थोडी सवलत किंवा आपत्कालीन क्रेडिट देतात, आणि अधिसूचित रात्रीच्या वेळेत किंवा
                सुट्टीच्या दिवशी वीज तोडत नाहीत.`,
           ta: `ப்ரீபெய்டு பேலன்ஸ் DISCOM நிர்ணயித்த அளவுக்குக் கீழே சென்றால் இது எரியும். பெரும்பாலான
                இந்திய DISCOM-கள் அதன் பிறகு சிறிது சலுகை அல்லது அவசரக் கடன் தருகின்றன, அறிவிக்கப்பட்ட
                இரவு நேரங்களிலோ விடுமுறை நாட்களிலோ துண்டிப்பதில்லை.` } },

    { t: { en: 'Main reading', hi: 'मुख्य रीडिंग', mr: 'मुख्य रीडिंग', ta: 'முதன்மை ரீடிங்' },
      d: { en: `the value currently being displayed. On a prepaid meter the display cycles between
                your remaining <strong>₹ balance</strong> and the cumulative energy registers, so
                the big number is not always the same quantity.`,
           hi: `इस समय दिख रहा मान। प्रीपेड मीटर में डिस्प्ले बारी-बारी से आपका बचा हुआ
                <strong>₹ बैलेंस</strong> और कुल यूनिट वाले रजिस्टर दिखाता है, इसलिए बड़ी संख्या हर बार एक
                ही चीज़ नहीं होती।`,
           mr: `सध्या दिसणारे मूल्य. प्रीपेड मीटरमध्ये डिस्प्ले आळीपाळीने तुमचा शिल्लक
                <strong>₹ बॅलन्स</strong> आणि एकूण युनिटचे रजिस्टर दाखवतो, त्यामुळे मोठा आकडा प्रत्येक वेळी
                एकच गोष्ट नसतो.`,
           ta: `தற்போது காட்டப்படும் மதிப்பு. ப்ரீபெய்டு மீட்டரில் டிஸ்ப்ளே மாறி மாறி உங்கள் மீதமுள்ள
                <strong>₹ பேலன்ஸையும்</strong> மொத்த யூனிட் ரெஜிஸ்டர்களையும் காட்டும், எனவே பெரிய எண்
                எப்போதும் ஒரே அளவீடு அல்ல.` } },

    { t: { en: 'Register code', hi: 'रजिस्टर कोड', mr: 'रजिस्टर कोड', ta: 'ரெஜிஸ்டர் குறியீடு' },
      d: { en: `the small code that tells you <em>which</em> quantity the big number is. This is the
                single most useful thing on the face, and the one nobody is told about. The codes
                are standardised; see the table below.`,
           hi: `वह छोटा कोड जो बताता है कि बड़ी संख्या <em>किस</em> चीज़ की है। मीटर पर यही सबसे काम की
                जानकारी है, और यही किसी को बताई नहीं जाती। ये कोड मानकीकृत हैं; नीचे दी तालिका देखिए।`,
           mr: `तो छोटा कोड जो सांगतो की मोठा आकडा <em>कशाचा</em> आहे. मीटरवरील हीच सर्वात उपयुक्त माहिती
                आहे, आणि तीच कोणाला सांगितली जात नाही. हे कोड प्रमाणित आहेत; खालील तक्ता पाहा.`,
           ta: `பெரிய எண் <em>எதைக்</em> குறிக்கிறது என்பதைச் சொல்லும் சிறிய குறியீடு. மீட்டரில் இதுவே
                மிகவும் பயனுள்ள தகவல், இதுவே யாருக்கும் சொல்லப்படுவதில்லை. இக்குறியீடுகள் தரப்படுத்தப்
                பட்டவை; கீழே உள்ள அட்டவணையைப் பாருங்கள்.` } },

    { t: { en: 'Unit label', hi: 'यूनिट लेबल', mr: 'युनिट लेबल', ta: 'யூனிட் லேபிள்' },
      d: { en: `<code>kWh</code> for energy, <code>kVAh</code> for apparent energy,
                <code>kW</code>/<code>kVA</code> for demand, <code>₹</code> for prepaid balance. If
                your meter bills on kVAh, a poor power factor raises the bill even when kWh stays
                flat.`,
           hi: `ऊर्जा के लिए <code>kWh</code>, आभासी ऊर्जा के लिए <code>kVAh</code>, डिमांड के लिए
                <code>kW</code>/<code>kVA</code>, और प्रीपेड बैलेंस के लिए <code>₹</code>। अगर आपका
                बिल kVAh पर बनता है, तो पावर फैक्टर खराब होने पर kWh वही रहने के बावजूद बिल बढ़ जाता है।`,
           mr: `ऊर्जेसाठी <code>kWh</code>, आभासी ऊर्जेसाठी <code>kVAh</code>, डिमांडसाठी
                <code>kW</code>/<code>kVA</code>, आणि प्रीपेड बॅलन्ससाठी <code>₹</code>. तुमचे बिल kVAh वर
                होत असेल, तर पॉवर फॅक्टर खराब असल्यास kWh तेवढेच राहूनही बिल वाढते.`,
           ta: `ஆற்றலுக்கு <code>kWh</code>, தோற்ற ஆற்றலுக்கு <code>kVAh</code>, டிமாண்டுக்கு
                <code>kW</code>/<code>kVA</code>, ப்ரீபெய்டு பேலன்ஸுக்கு <code>₹</code>. உங்கள் பில்
                kVAh அடிப்படையில் இருந்தால், பவர் ஃபேக்டர் மோசமாக இருக்கும்போது kWh மாறாவிட்டாலும் பில்
                அதிகரிக்கும்.` } },

    { t: { en: 'Pulse LED', hi: 'पल्स LED', mr: 'पल्स LED', ta: 'பல்ஸ் LED' },
      d: { en: `flashes a fixed number of times per unit consumed, printed beside it (commonly 1000
                imp/kWh, i.e. one flash per watt-hour). It is a direct load indicator:
                <strong>faster flashing means more load right now</strong>. Switch everything off
                and it should slow to almost nothing.`,
           hi: `हर यूनिट खपत पर तय संख्या में चमकती है — यह संख्या उसके पास लिखी होती है (आम तौर पर 1000
                imp/kWh, यानी हर वाट-घंटे पर एक फ्लैश)। यह सीधे लोड बताती है:
                <strong>जितनी तेज़ चमक, उतना ज़्यादा लोड अभी</strong>। सब कुछ बंद कर दीजिए तो यह लगभग रुक
                जानी चाहिए।`,
           mr: `प्रत्येक युनिट वापरावर ठराविक वेळा चमकते — ती संख्या शेजारी लिहिलेली असते (सामान्यतः 1000
                imp/kWh, म्हणजे प्रत्येक वॅट-तासाला एक फ्लॅश). हे थेट लोड दर्शवते:
                <strong>जितकी वेगवान चमक, तितका जास्त लोड आत्ता</strong>. सर्व बंद केल्यावर ती जवळपास
                थांबायला हवी.`,
           ta: `ஒவ்வொரு யூனிட் நுகர்வுக்கும் நிர்ணயிக்கப்பட்ட எண்ணிக்கையில் சிமிட்டும் — அந்த எண்
                அருகிலேயே அச்சிடப்பட்டிருக்கும் (பொதுவாக 1000 imp/kWh, அதாவது ஒரு வாட்-மணிக்கு ஒரு
                ஒளிர்வு). இது நேரடி லோட் காட்டி: <strong>வேகமாகச் சிமிட்டினால் இப்போது அதிக லோட்</strong>.
                அனைத்தையும் அணைத்தால் இது கிட்டத்தட்ட நின்றுவிட வேண்டும்.` } },

    { t: { en: 'Display button', hi: 'डिस्प्ले बटन', mr: 'डिस्प्ले बटण', ta: 'டிஸ்ப்ளே பொத்தான்' },
      d: { en: `(marked <em>Scroll</em> or <em>Push</em>) — steps the display through the register
                list manually instead of waiting for the auto-scroll. A long press usually opens a
                second, deeper list (billing history, tamper log) on most makes.`,
           hi: `(इस पर <em>Scroll</em> या <em>Push</em> लिखा होता है) — अपने आप बदलने का इंतज़ार किए बिना
                रजिस्टर की सूची एक-एक करके देखने के लिए। ज़्यादातर मीटरों में देर तक दबाने पर दूसरी, और
                विस्तृत सूची खुलती है (बिलिंग इतिहास, टैम्पर लॉग)।`,
           mr: `(यावर <em>Scroll</em> किंवा <em>Push</em> लिहिलेले असते) — आपोआप बदलण्याची वाट न पाहता
                रजिस्टरची यादी एकेक करून पाहण्यासाठी. बहुतेक मीटरमध्ये जास्त वेळ दाबल्यास दुसरी, अधिक
                तपशीलवार यादी उघडते (बिलिंग इतिहास, टॅम्पर लॉग).`,
           ta: `(<em>Scroll</em> அல்லது <em>Push</em> என்று குறிக்கப்பட்டிருக்கும்) — தானாக மாறுவதற்குக்
                காத்திராமல் ரெஜிஸ்டர் பட்டியலை ஒவ்வொன்றாகப் பார்க்க. பெரும்பாலான மீட்டர்களில் நீண்ட நேரம்
                அழுத்தினால் இரண்டாவது, விரிவான பட்டியல் திறக்கும் (பில்லிங் வரலாறு, டேம்பர் பதிவு).` } },

    { t: { en: 'Nameplate', hi: 'नेमप्लेट', mr: 'नेमप्लेट', ta: 'நேம்பிளேட்' },
      d: { en: `meter serial number, standard mark, accuracy class and current rating. <strong>The
                serial number here must match the one on your bill.</strong> That single check
                catches the mis-assigned-meter billing error, which is one of the more common and
                most expensive to unwind after the fact.`,
           hi: `मीटर का सीरियल नंबर, मानक चिह्न, सटीकता श्रेणी और करंट रेटिंग। <strong>यहाँ लिखा सीरियल
                नंबर आपके बिल पर लिखे नंबर से मिलना चाहिए।</strong> यही एक जाँच किसी और का मीटर आपके नाम
                जुड़ जाने वाली गलती पकड़ लेती है — यह गलती आम है और बाद में सुलझाना सबसे महँगा पड़ता है।`,
           mr: `मीटरचा सीरियल क्रमांक, मानक चिन्ह, अचूकता श्रेणी आणि करंट रेटिंग. <strong>येथील सीरियल
                क्रमांक तुमच्या बिलावरील क्रमांकाशी जुळायला हवा.</strong> हीच एक तपासणी दुसऱ्याचा मीटर
                तुमच्या नावावर लागण्याची चूक पकडते — ही चूक सामान्य आहे आणि नंतर सोडवणे सर्वात महाग पडते.`,
           ta: `மீட்டரின் வரிசை எண், தரக் குறியீடு, துல்லிய வகுப்பு மற்றும் மின்னோட்ட மதிப்பீடு.
                <strong>இங்குள்ள வரிசை எண் உங்கள் பில்லில் உள்ளதுடன் பொருந்த வேண்டும்.</strong> இந்த ஒரு
                சரிபார்ப்பே வேறொருவரின் மீட்டர் உங்கள் பெயரில் பதிவாகும் பிழையைப் பிடிக்கும் — இது
                பொதுவானது, பின்னர் சரிசெய்வது மிகவும் விலை உயர்ந்தது.` } },

    { t: { en: 'Optical port', hi: 'ऑप्टिकल पोर्ट', mr: 'ऑप्टिकल पोर्ट', ta: 'ஆப்டிக்கல் போர்ட்' },
      d: { en: `the round infrared service window used by authorised meter readers and technicians
                to download data directly from the meter. You do not need it for normal reading:
                use the display button and register codes instead.`,
           hi: `गोल इन्फ्रारेड सर्विस विंडो, जिससे अधिकृत मीटर रीडर या तकनीशियन मीटर से डेटा सीधे
                डाउनलोड करते हैं। सामान्य रीडिंग के लिए इसकी ज़रूरत नहीं होती: डिस्प्ले बटन और
                रजिस्टर कोड देखें।`,
           mr: `अधिकृत मीटर रीडर किंवा तंत्रज्ञ मीटरमधून डेटा थेट डाउनलोड करण्यासाठी वापरत असलेली
                गोल इन्फ्रारेड सर्विस विंडो. सामान्य रीडिंगसाठी याची गरज नसते: डिस्प्ले बटण आणि
                रजिस्टर कोड वापरा.`,
           ta: `அங்கீகரிக்கப்பட்ட மீட்டர் ரீடர்கள் அல்லது தொழில்நுட்பர்கள் மீட்டரிலிருந்து தரவை நேரடியாக
                பதிவிறக்கப் பயன்படுத்தும் வட்டமான இன்ஃப்ராரெட் சேவை சாளரம். சாதாரண ரீடிங்கிற்கு இது
                தேவையில்லை: டிஸ்ப்ளே பொத்தானையும் ரெஜிஸ்டர் குறியீடுகளையும் பயன்படுத்துங்கள்.` } },

    { t: { en: 'Terminal points', hi: 'टर्मिनल पॉइंट', mr: 'टर्मिनल पॉइंट', ta: 'டெர்மினல் புள்ளிகள்' },
      d: { en: `the sealed connection points where incoming supply and outgoing house wiring are
                terminated. Do not open this cover yourself: a broken seal or loose terminal can
                be logged as tamper and can be dangerous.`,
           hi: `सील किए गए कनेक्शन पॉइंट, जहाँ आने वाली सप्लाई और घर की आउटगोइंग वायरिंग जुड़ती है।
                यह कवर खुद न खोलें: सील टूटना या ढीला टर्मिनल टैम्पर के रूप में दर्ज हो सकता है और
                खतरनाक भी है।`,
           mr: `सील केलेले कनेक्शन पॉइंट, जिथे येणारा पुरवठा आणि घराकडे जाणारी वायरिंग जोडली जाते.
                हे कव्हर स्वतः उघडू नका: सील तुटणे किंवा सैल टर्मिनल टॅम्पर म्हणून नोंदले जाऊ शकते
                आणि धोकादायक असते.`,
           ta: `உள்வரும் மின்விநியோகம் மற்றும் வீட்டிற்கு செல்லும் வயரிங் இணைக்கப்படும் சீல் செய்யப்பட்ட
                இணைப்பு புள்ளிகள். இந்த மூடியை நீங்களே திறக்க வேண்டாம்: சீல் உடைதல் அல்லது தளர்ந்த
                டெர்மினல் டேம்பர் என பதிவாகலாம், மேலும் அது ஆபத்தானது.` } },
  ],

  // ── register codes ────────────────────────────────────────────────────────
  codesH2: {
    en: 'Register codes: which number is which',
    hi: 'रजिस्टर कोड: कौन-सी संख्या किसकी है',
    mr: 'रजिस्टर कोड: कोणता आकडा कशाचा',
    ta: 'ரெஜிஸ்டர் குறியீடுகள்: எந்த எண் எது',
  },
  codesIntro: {
    en: `The codes are <strong>OBIS codes</strong> (IEC 62056-61), the same scheme across every
         compliant meter regardless of who made it. Once you can read these, the display stops
         being a random sequence of numbers.`,
    hi: `ये <strong>OBIS कोड</strong> हैं (IEC 62056-61) — हर मानक मीटर में एक जैसे, चाहे उसे किसी ने भी
         बनाया हो। ये पढ़ना आ जाए तो डिस्प्ले बेतरतीब संख्याओं का सिलसिला नहीं रह जाता।`,
    mr: `हे <strong>OBIS कोड</strong> आहेत (IEC 62056-61) — प्रत्येक मानक मीटरमध्ये सारखेच, तो कोणीही
         बनवलेला असो. हे वाचता आले की डिस्प्ले म्हणजे अनियमित आकड्यांची मालिका राहत नाही.`,
    ta: `இவை <strong>OBIS குறியீடுகள்</strong> (IEC 62056-61) — யார் தயாரித்தாலும் ஒவ்வொரு தரமான
         மீட்டரிலும் ஒரே மாதிரி. இதைப் படிக்கத் தெரிந்தால், டிஸ்ப்ளே தற்செயலான எண் வரிசையாக இருக்காது.`,
  },
  codesTh: {
    code: { en: 'Code', hi: 'कोड', mr: 'कोड', ta: 'குறியீடு' },
    what: { en: 'What the number is', hi: 'संख्या किसकी है', mr: 'आकडा कशाचा आहे', ta: 'எண் எதைக் குறிக்கிறது' },
    why: { en: 'Why you would want it', hi: 'यह क्यों काम की है', mr: 'ही का उपयोगी आहे', ta: 'இது ஏன் பயனுள்ளது' },
  },
  codes: [
    { c: '1.8.0',
      w: { en: 'Total active energy imported (kWh)', hi: 'कुल ली गई सक्रिय ऊर्जा (kWh)', mr: 'एकूण घेतलेली सक्रिय ऊर्जा (kWh)', ta: 'மொத்த இறக்குமதி ஆற்றல் (kWh)' },
      y: { en: 'Your actual cumulative consumption — the figure that drives the bill',
           hi: 'आपकी असली कुल खपत — बिल इसी से बनता है',
           mr: 'तुमचा खरा एकूण वापर — बिल याच्यावरून ठरते',
           ta: 'உங்கள் உண்மையான மொத்த நுகர்வு — பில் இதிலிருந்தே' } },
    { c: '1.8.1 / 1.8.2',
      w: { en: 'Energy in ToD zone 1 / zone 2', hi: 'ToD ज़ोन 1 / ज़ोन 2 की ऊर्जा', mr: 'ToD झोन 1 / झोन 2 ची ऊर्जा', ta: 'ToD மண்டலம் 1 / 2 ஆற்றல்' },
      y: { en: 'Splits consumption by time band on a time-of-day tariff',
           hi: 'टाइम-ऑफ-डे टैरिफ में खपत को समय-बैंड के हिसाब से बाँटता है',
           mr: 'टाइम-ऑफ-डे दरात वापर वेळेच्या पट्ट्यांनुसार विभागतो',
           ta: 'நேர அடிப்படை கட்டணத்தில் நுகர்வை நேரப் பிரிவாகப் பிரிக்கும்' } },
    { c: '9.8.0',
      w: { en: 'Total apparent energy (kVAh)', hi: 'कुल आभासी ऊर्जा (kVAh)', mr: 'एकूण आभासी ऊर्जा (kVAh)', ta: 'மொத்த தோற்ற ஆற்றல் (kVAh)' },
      y: { en: 'The billed quantity where the DISCOM bills on kVAh',
           hi: 'जहाँ डिस्कॉम kVAh पर बिल बनाता है, वहाँ यही मात्रा बिल में लगती है',
           mr: 'जिथे डिस्कॉम kVAh वर बिल करते तिथे हीच रक्कम बिलात येते',
           ta: 'DISCOM kVAh அடிப்படையில் பில் போடும் இடத்தில் இதுவே கணக்கிடப்படும்' } },
    { c: '1.6.0',
      w: { en: 'Maximum demand (kW or kVA)', hi: 'अधिकतम डिमांड (kW या kVA)', mr: 'कमाल डिमांड (kW किंवा kVA)', ta: 'அதிகபட்ச டிமாண்ட் (kW / kVA)' },
      y: { en: 'The peak that sets your demand charge and flags load excess',
           hi: 'वह उच्चतम स्तर जो डिमांड चार्ज तय करता है और लोड ज़्यादा होने पर संकेत देता है',
           mr: 'तो उच्चांक जो डिमांड चार्ज ठरवतो आणि लोड जास्त झाल्याचे दर्शवतो',
           ta: 'டிமாண்ட் கட்டணத்தை நிர்ணயித்து லோட் அதிகரிப்பைக் காட்டும் உச்சம்' } },
    { c: '0.9.1 / 0.9.2',
      w: { en: 'Meter time / date', hi: 'मीटर का समय / तारीख', mr: 'मीटरची वेळ / तारीख', ta: 'மீட்டர் நேரம் / தேதி' },
      y: { en: 'A drifting clock mis-sorts ToD consumption into the wrong band',
           hi: 'घड़ी आगे-पीछे हो तो ToD की खपत गलत बैंड में चली जाती है',
           mr: 'घड्याळ मागेपुढे असल्यास ToD चा वापर चुकीच्या पट्ट्यात जातो',
           ta: 'கடிகாரம் விலகினால் ToD நுகர்வு தவறான பிரிவில் சேரும்' } },
    { c: '2.8.0',
      w: { en: 'Total active energy exported (kWh)', hi: 'कुल भेजी गई सक्रिय ऊर्जा (kWh)', mr: 'एकूण पाठवलेली सक्रिय ऊर्जा (kWh)', ta: 'மொத்த ஏற்றுமதி ஆற்றல் (kWh)' },
      y: { en: 'Units your rooftop solar sent to the grid, on a net-metered connection',
           hi: 'नेट-मीटरिंग में आपके रूफटॉप सोलर से ग्रिड को भेजी गई यूनिट',
           mr: 'नेट-मीटरिंगमध्ये तुमच्या रूफटॉप सोलरने ग्रिडला पाठवलेली युनिट',
           ta: 'நெட்-மீட்டரிங்கில் உங்கள் சூரிய மின்சாரம் கிரிட்டுக்கு அனுப்பிய யூனிட்' } },
  ],
  codesNote: {
    en: `Prepaid balance and emergency-credit registers are not fixed by the OBIS standard in the
         same way — different makes label them differently (<code>Bal</code>, <code>Cr</code>, or a
         plain ₹ figure). Read the value with the ₹ sign, not the code.`,
    hi: `प्रीपेड बैलेंस और इमरजेंसी क्रेडिट के रजिस्टर OBIS मानक में उस तरह तय नहीं हैं — अलग-अलग कंपनियाँ
         उन्हें अलग नाम देती हैं (<code>Bal</code>, <code>Cr</code>, या सिर्फ़ ₹ वाली संख्या)। ₹ चिह्न वाली
         संख्या देखिए, कोड नहीं।`,
    mr: `प्रीपेड बॅलन्स आणि आपत्कालीन क्रेडिटचे रजिस्टर OBIS मानकात तसे निश्चित नाहीत — वेगवेगळ्या कंपन्या
         त्यांना वेगळी नावे देतात (<code>Bal</code>, <code>Cr</code>, किंवा फक्त ₹ असलेला आकडा). ₹ चिन्ह
         असलेला आकडा पाहा, कोड नव्हे.`,
    ta: `ப்ரீபெய்டு பேலன்ஸ் மற்றும் அவசரக் கடன் ரெஜிஸ்டர்கள் OBIS தரத்தில் அப்படி நிர்ணயிக்கப்படவில்லை —
         வெவ்வேறு நிறுவனங்கள் வெவ்வேறு பெயரிடும் (<code>Bal</code>, <code>Cr</code>, அல்லது ₹ எண்).
         குறியீட்டை அல்ல, ₹ சின்னமுள்ள மதிப்பைப் பாருங்கள்.`,
  },
  ctaTitle: {
    en: 'Got your <code>1.8.0</code> reading?', hi: '<code>1.8.0</code> रीडिंग मिल गई?',
    mr: '<code>1.8.0</code> रीडिंग मिळाले?', ta: '<code>1.8.0</code> ரீடிங் கிடைத்ததா?',
  },
  ctaBody: {
    en: `Subtract last month's, and put the difference in — you'll get an itemised, slab-wise
         estimate on your own DISCOM's rates.`,
    hi: `पिछले महीने की रीडिंग घटाइए और अंतर डालिए — आपको अपने डिस्कॉम की असली दरों पर स्लैब-वार, मद-वार
         अनुमान मिलेगा।`,
    mr: `मागील महिन्याचे रीडिंग वजा करा आणि फरक टाका — तुम्हाला तुमच्या डिस्कॉमच्या खऱ्या दरांवर
         स्लॅबनिहाय, बाबनिहाय अंदाज मिळेल.`,
    ta: `கடந்த மாத ரீடிங்கைக் கழித்து வித்தியாசத்தை உள்ளிடுங்கள் — உங்கள் DISCOM-இன் உண்மையான
         கட்டணத்தில் ஸ்லாப் வாரியான மதிப்பீடு கிடைக்கும்.`,
  },
  ctaBtn: {
    en: 'Calculate my bill', hi: 'मेरा बिल जोड़ें',
    mr: 'माझे बिल काढा', ta: 'என் பில்லைக் கணக்கிடு',
  },

  // ── three-phase ───────────────────────────────────────────────────────────
  threeH2: {
    en: 'Three-phase meters: what changes', hi: 'थ्री-फेज़ मीटर: क्या बदलता है',
    mr: 'थ्री-फेज मीटर: काय बदलते', ta: 'த்ரீ-ஃபேஸ் மீட்டர்: என்ன மாறுகிறது',
  },
  threeIntro: {
    en: `Everything above describes a single-phase meter, which is what most homes have. Larger
         homes, shops and small industrial connections run <strong>three-phase</strong>. The good
         news is that the part that confuses people does not change: <strong>the register codes are
         identical</strong>. <code>1.8.0</code> is still total imported energy, <code>1.6.0</code>
         is still maximum demand, and the status icons mean the same things.`,
    hi: `ऊपर बताया सब कुछ सिंगल-फेज़ मीटर के बारे में है, जो ज़्यादातर घरों में लगा होता है। बड़े घर, दुकानें और
         छोटे उद्योग <strong>थ्री-फेज़</strong> पर चलते हैं। अच्छी बात यह है कि जो हिस्सा लोगों को उलझाता है वह
         बदलता नहीं: <strong>रजिस्टर कोड बिल्कुल वही रहते हैं</strong>। <code>1.8.0</code> अब भी कुल ली गई
         ऊर्जा है, <code>1.6.0</code> अब भी अधिकतम डिमांड, और स्थिति के आइकन का मतलब भी वही।`,
    mr: `वरील सर्व सिंगल-फेज मीटरबद्दल आहे, जो बहुतेक घरांत असतो. मोठी घरे, दुकाने आणि छोटे उद्योग
         <strong>थ्री-फेज</strong> वर चालतात. चांगली बातमी अशी की लोकांना गोंधळात टाकणारा भाग बदलत नाही:
         <strong>रजिस्टर कोड तेच राहतात</strong>. <code>1.8.0</code> अजूनही एकूण घेतलेली ऊर्जा,
         <code>1.6.0</code> अजूनही कमाल डिमांड, आणि स्थितीच्या आयकॉनचा अर्थही तोच.`,
    ta: `மேலே உள்ளதெல்லாம் சிங்கிள்-ஃபேஸ் மீட்டரைப் பற்றியது, பெரும்பாலான வீடுகளில் அதுதான். பெரிய வீடுகள்,
         கடைகள், சிறு தொழில்கள் <strong>த்ரீ-ஃபேஸில்</strong> இயங்கும். நல்ல செய்தி: குழப்பும் பகுதி
         மாறுவதில்லை — <strong>ரெஜிஸ்டர் குறியீடுகள் அப்படியே</strong>. <code>1.8.0</code> இன்னும் மொத்த
         இறக்குமதி ஆற்றல், <code>1.6.0</code> இன்னும் அதிகபட்ச டிமாண்ட், நிலை ஐகான்களின் பொருளும் அதுவே.`,
  },
  threeLead: { en: 'What differs:', hi: 'क्या अलग होता है:', mr: 'काय वेगळे असते:', ta: 'என்ன வேறுபடுகிறது:' },
  threePoints: [
    { t: { en: 'More terminals.', hi: 'ज़्यादा टर्मिनल।', mr: 'अधिक टर्मिनल.', ta: 'அதிக டெர்மினல்கள்.' },
      d: { en: `Three phases plus neutral, so the terminal block is wider — usually eight ways
                rather than five. Nothing you should ever open; the cover is sealed and breaking
                that seal is itself a tamper event.`,
           hi: `तीन फेज़ और एक न्यूट्रल, इसलिए टर्मिनल ब्लॉक चौड़ा होता है — आम तौर पर पाँच के बजाय आठ। इसे
                कभी खोलना नहीं चाहिए; कवर सील होता है और सील तोड़ना खुद एक टैम्पर घटना है।`,
           mr: `तीन फेज आणि एक न्यूट्रल, त्यामुळे टर्मिनल ब्लॉक रुंद असतो — सहसा पाचऐवजी आठ. तो कधीही उघडू
                नये; कव्हर सील असते आणि सील तोडणे हीच टॅम्परची घटना ठरते.`,
           ta: `மூன்று ஃபேஸ் மற்றும் நியூட்ரல், எனவே டெர்மினல் தொகுதி அகலமானது — பொதுவாக ஐந்துக்குப் பதிலாக
                எட்டு. இதை ஒருபோதும் திறக்கக் கூடாது; மூடி முத்திரையிடப்பட்டது, முத்திரையை உடைப்பதே
                டேம்பர் நிகழ்வு.` } },
    { t: { en: 'Per-phase registers.', hi: 'हर फेज़ के रजिस्टर।', mr: 'प्रत्येक फेजचे रजिस्टर.', ta: 'ஒவ்வொரு ஃபேஸ் ரெஜிஸ்டர்.' },
      d: { en: `The display cycle adds per-phase voltage and current, often shown as <code>L1</code>,
                <code>L2</code>, <code>L3</code>. A phase reading zero volts when the others are
                live means you have lost a phase — that is a supply fault to report, not a meter
                fault.`,
           hi: `डिस्प्ले में हर फेज़ का वोल्टेज और करंट भी जुड़ जाता है, जो अक्सर <code>L1</code>,
                <code>L2</code>, <code>L3</code> के रूप में दिखता है। बाकी फेज़ चालू हों और कोई एक शून्य
                वोल्ट दिखाए, तो वह फेज़ चला गया है — यह सप्लाई की खराबी है, मीटर की नहीं; इसकी शिकायत कीजिए।`,
           mr: `डिस्प्लेमध्ये प्रत्येक फेजचे व्होल्टेज आणि करंटही जोडले जाते, जे बहुधा <code>L1</code>,
                <code>L2</code>, <code>L3</code> असे दिसते. इतर फेज चालू असताना एखादा शून्य व्होल्ट दाखवत
                असेल, तर तो फेज गेला आहे — ही पुरवठ्याची बिघाड आहे, मीटरची नाही; तक्रार करा.`,
           ta: `டிஸ்ப்ளேயில் ஒவ்வொரு ஃபேஸின் மின்னழுத்தமும் மின்னோட்டமும் சேரும், பொதுவாக <code>L1</code>,
                <code>L2</code>, <code>L3</code> எனக் காட்டப்படும். மற்றவை இயங்கும்போது ஒன்று பூஜ்ஜியம்
                காட்டினால் அந்த ஃபேஸ் போய்விட்டது — இது விநியோகக் கோளாறு, மீட்டர் கோளாறு அல்ல.` } },
    { t: { en: 'kVAh and demand matter more.', hi: 'kVAh और डिमांड ज़्यादा मायने रखते हैं।', mr: 'kVAh आणि डिमांड जास्त महत्त्वाचे.', ta: 'kVAh, டிமாண்ட் முக்கியம்.' },
      d: { en: `Three-phase connections are far more likely to be billed on kVAh and to carry a
                maximum demand charge, so <code>9.8.0</code> and <code>1.6.0</code> are the
                registers to watch — a poor power factor costs you real money here in a way it
                usually does not on a domestic single-phase supply.`,
           hi: `थ्री-फेज़ कनेक्शन पर बिल kVAh पर बनने और अधिकतम डिमांड चार्ज लगने की संभावना कहीं ज़्यादा होती
                है, इसलिए <code>9.8.0</code> और <code>1.6.0</code> पर नज़र रखिए — यहाँ खराब पावर फैक्टर सीधे
                पैसे का नुकसान करता है, जो घरेलू सिंगल-फेज़ में आम तौर पर नहीं होता।`,
           mr: `थ्री-फेज कनेक्शनवर बिल kVAh वर होण्याची आणि कमाल डिमांड चार्ज लागण्याची शक्यता खूप जास्त
                असते, त्यामुळे <code>9.8.0</code> आणि <code>1.6.0</code> वर लक्ष ठेवा — इथे खराब पॉवर
                फॅक्टर थेट पैशाचे नुकसान करतो, जे घरगुती सिंगल-फेजमध्ये सहसा होत नाही.`,
           ta: `த்ரீ-ஃபேஸ் இணைப்புகளுக்கு kVAh அடிப்படையில் பில் வருவதற்கும் அதிகபட்ச டிமாண்ட் கட்டணம்
                வருவதற்கும் வாய்ப்பு அதிகம், எனவே <code>9.8.0</code>, <code>1.6.0</code> ஆகியவற்றைக்
                கவனியுங்கள் — இங்கு மோசமான பவர் ஃபேக்டர் நேரடியாகப் பணம் இழக்கச் செய்யும், வீட்டு
                சிங்கிள்-ஃபேஸில் பொதுவாக அப்படி இல்லை.` } },
    { t: { en: 'Load limit is per connection, not per phase.', hi: 'लोड सीमा पूरे कनेक्शन पर, हर फेज़ पर नहीं।', mr: 'लोड मर्यादा संपूर्ण कनेक्शनवर, प्रत्येक फेजवर नाही.', ta: 'லோட் வரம்பு இணைப்புக்கு, ஃபேஸுக்கு அல்ல.' },
      d: { en: `Tripping is assessed on total sanctioned load, so an unbalanced load across the
                three phases can trip you while each individual phase still looks modest.`,
           hi: `ट्रिप कुल स्वीकृत लोड पर तय होता है, इसलिए तीनों फेज़ पर लोड असंतुलित हो तो हर फेज़ अलग-अलग कम
                दिखने के बावजूद कनेक्शन ट्रिप हो सकता है।`,
           mr: `ट्रिप एकूण मंजूर लोडवर ठरते, त्यामुळे तिन्ही फेजवर लोड असंतुलित असल्यास प्रत्येक फेज वेगळा
                कमी दिसत असूनही कनेक्शन ट्रिप होऊ शकते.`,
           ta: `டிரிப் மொத்த அனுமதிக்கப்பட்ட லோட் அடிப்படையில் தீர்மானிக்கப்படும், எனவே மூன்று ஃபேஸ்களில்
                லோட் சமநிலையற்று இருந்தால் ஒவ்வொன்றும் குறைவாகத் தோன்றினாலும் டிரிப் ஆகலாம்.` } },
  ],
  threeOutro: {
    en: 'If demand charges are what you are trying to control, the <a href="%PFX%/sanctioned-load-optimizer/">sanctioned load optimizer</a> works from the same tariff data as the calculator.',
    hi: 'अगर आप डिमांड चार्ज घटाना चाहते हैं, तो <a href="%PFX%/sanctioned-load-optimizer/">सैंक्शन्ड लोड ऑप्टिमाइज़र</a> उसी टैरिफ डेटा पर काम करता है जिस पर कैलकुलेटर।',
    mr: 'डिमांड चार्ज कमी करायचे असतील, तर <a href="%PFX%/sanctioned-load-optimizer/">सँक्शन्ड लोड ऑप्टिमायझर</a> कॅल्क्युलेटरच्याच टॅरिफ डेटावर चालतो.',
    ta: 'டிமாண்ட் கட்டணத்தைக் கட்டுப்படுத்த விரும்பினால், <a href="%PFX%/sanctioned-load-optimizer/">அனுமதிக்கப்பட்ட லோட் ஆப்டிமைசர்</a> கால்குலேட்டரின் அதே கட்டணத் தரவில் இயங்குகிறது.',
  },

  // ── who installed it ──────────────────────────────────────────────────────
  amispH2: {
    en: 'Who installed your meter', hi: 'आपका मीटर किसने लगाया',
    mr: 'तुमचे मीटर कोणी बसवले', ta: 'உங்கள் மீட்டரை யார் நிறுவினார்',
  },
  amispP1: {
    en: `Under <strong>RDSS</strong>, DISCOMs mostly do not install smart meters themselves. They
         appoint an <strong>AMISP</strong> — a contractor that supplies, installs and then operates
         the metering system, paid per meter per month over eight to ten years rather than up front.`,
    hi: `<strong>RDSS</strong> के तहत ज़्यादातर डिस्कॉम खुद स्मार्ट मीटर नहीं लगाते। वे एक
         <strong>AMISP</strong> नियुक्त करते हैं — एक ठेकेदार जो मीटर देता है, लगाता है और फिर पूरी मीटरिंग
         व्यवस्था चलाता है, जिसे आठ से दस साल तक हर मीटर पर हर महीने भुगतान मिलता है, शुरू में एकमुश्त नहीं।`,
    mr: `<strong>RDSS</strong> अंतर्गत बहुतेक डिस्कॉम स्वतः स्मार्ट मीटर बसवत नाहीत. ते एक
         <strong>AMISP</strong> नेमतात — एक कंत्राटदार जो मीटर पुरवतो, बसवतो आणि नंतर संपूर्ण मीटरिंग
         यंत्रणा चालवतो, ज्याला आठ ते दहा वर्षे दरमहा प्रति मीटर पैसे मिळतात, सुरुवातीला एकरकमी नाही.`,
    ta: `<strong>RDSS</strong> கீழ் பெரும்பாலான DISCOM-கள் தாமே ஸ்மார்ட் மீட்டர்களை நிறுவுவதில்லை. அவை ஒரு
         <strong>AMISP</strong>-ஐ நியமிக்கின்றன — மீட்டர்களை வழங்கி, நிறுவி, பின்னர் முழு மீட்டரிங்
         அமைப்பையும் இயக்கும் ஒப்பந்ததாரர், எட்டு முதல் பத்து ஆண்டுகளுக்கு மாதம்தோறும் மீட்டருக்குக்
         கட்டணம் பெறுவார், முன்பணமாக அல்ல.`,
  },
  amispP2: {
    en: `It matters in one narrow case: a dispute about the <em>installation or the device</em> — a
         meter fitted at the wrong premises, a serial number that does not match your bill, a unit
         that failed within weeks. Your contract is still with the DISCOM and that is where the
         complaint goes, but the AMISP is who gets sent to look at it.`,
    hi: `यह सिर्फ़ एक स्थिति में मायने रखता है: जब विवाद <em>इंस्टॉलेशन या डिवाइस</em> का हो — मीटर गलत जगह
         लग गया हो, सीरियल नंबर बिल से न मिलता हो, या मीटर कुछ ही हफ़्तों में खराब हो गया हो। आपका करार फिर
         भी डिस्कॉम से है और शिकायत वहीं जाएगी, लेकिन देखने के लिए AMISP को ही भेजा जाता है।`,
    mr: `हे फक्त एकाच परिस्थितीत महत्त्वाचे: वाद <em>बसवणुकीचा किंवा उपकरणाचा</em> असेल तेव्हा — मीटर चुकीच्या
         जागी बसले असेल, सीरियल क्रमांक बिलाशी जुळत नसेल, किंवा मीटर काही आठवड्यांतच बिघडले असेल. तुमचा करार
         तरीही डिस्कॉमशीच आहे आणि तक्रार तिथेच जाईल, पण पाहायला AMISP लाच पाठवले जाते.`,
    ta: `இது ஒரே ஒரு சூழலில் மட்டுமே முக்கியம்: <em>நிறுவல் அல்லது சாதனம்</em> குறித்த தகராறு — தவறான
         இடத்தில் மீட்டர் பொருத்தப்பட்டிருத்தல், பில்லுடன் பொருந்தாத வரிசை எண், சில வாரங்களிலேயே
         பழுதடைந்த மீட்டர். உங்கள் ஒப்பந்தம் DISCOM-உடன்தான், புகாரும் அங்குதான் செல்லும், ஆனால் பார்க்க
         வருபவர் AMISP.`,
  },
  amispNote: {
    en: `<strong>It does not tell you what your display will show.</strong> An AMISP fits meters from
         several manufacturers across its circles, so the symbols come from the meter's make and from
         IS 16444 — which is what the rest of this page covers.`,
    hi: `<strong>इससे यह पता नहीं चलता कि आपका डिस्प्ले क्या दिखाएगा।</strong> एक AMISP अपने अलग-अलग सर्किलों
         में कई कंपनियों के मीटर लगाता है, इसलिए चिह्न मीटर के मेक और IS 16444 से आते हैं — जो इस पेज का बाकी
         हिस्सा समझाता है।`,
    mr: `<strong>यावरून तुमचा डिस्प्ले काय दाखवेल हे कळत नाही.</strong> एक AMISP आपल्या वेगवेगळ्या सर्कलमध्ये
         अनेक कंपन्यांचे मीटर बसवतो, त्यामुळे चिन्हे मीटरच्या मेकवरून आणि IS 16444 वरून येतात — जे या पानाचा
         उर्वरित भाग समजावतो.`,
    ta: `<strong>உங்கள் டிஸ்ப்ளே என்ன காட்டும் என்பதை இது சொல்லாது.</strong> ஒரு AMISP தன் வெவ்வேறு
         வட்டங்களில் பல நிறுவனங்களின் மீட்டர்களைப் பொருத்தும், எனவே சின்னங்கள் மீட்டரின் தயாரிப்பு
         மற்றும் IS 16444-இலிருந்து வருகின்றன — அதுவே இந்தப் பக்கத்தின் மீதி விளக்குகிறது.`,
  },
  amispCard: {
    t: { en: 'AMISP list by state and DISCOM →', hi: 'राज्य और डिस्कॉम के अनुसार AMISP सूची →',
         mr: 'राज्य आणि डिस्कॉमनुसार AMISP यादी →', ta: 'மாநிலம் மற்றும் DISCOM வாரியாக AMISP பட்டியல் →' },
    d: { en: 'Every appointed AMISP we could establish, with a source link on each confirmed row and contracted meter counts',
         hi: 'हर वह AMISP जिसकी पुष्टि हम कर सके — हर पुष्ट पंक्ति पर स्रोत लिंक और अनुबंधित मीटर संख्या के साथ',
         mr: 'आम्ही निश्चित करू शकलो असे प्रत्येक AMISP — प्रत्येक पुष्ट ओळीवर स्रोत दुवा आणि करारातील मीटर संख्येसह',
         ta: 'நாங்கள் உறுதிப்படுத்திய ஒவ்வொரு AMISP-ம், உறுதியான வரிசைக்கு ஆதார இணைப்பு மற்றும் ஒப்பந்த மீட்டர் எண்ணிக்கையுடன்' },
  },

  // ── outbound cards ────────────────────────────────────────────────────────
  readingH2: {
    en: 'Take the reading yourself, then check the bill',
    hi: 'खुद रीडिंग लीजिए, फिर बिल जाँचिए',
    mr: 'स्वतः रीडिंग घ्या, मग बिल तपासा',
    ta: 'நீங்களே ரீடிங் எடுத்து, பின் பில்லைச் சரிபாருங்கள்',
  },
  readingP: {
    en: `Note the <code>1.8.0</code> figure on the same date each month. The difference between two
         readings is your consumption for that period — that is the whole of it, and it is the
         number your bill should be built from.`,
    hi: `हर महीने एक ही तारीख को <code>1.8.0</code> का आँकड़ा लिख लीजिए। दो रीडिंग का अंतर ही उस अवधि की आपकी
         खपत है — बस इतना ही, और बिल इसी संख्या पर बनना चाहिए।`,
    mr: `दर महिन्याला एकाच तारखेला <code>1.8.0</code> चा आकडा लिहून ठेवा. दोन रीडिंगमधील फरक हाच त्या
         कालावधीतील तुमचा वापर — एवढेच, आणि बिल याच आकड्यावर आधारित असावे.`,
    ta: `ஒவ்வொரு மாதமும் ஒரே தேதியில் <code>1.8.0</code> எண்ணைக் குறித்து வையுங்கள். இரண்டு ரீடிங்குகளின்
         வித்தியாசமே அந்தக் காலத்தின் நுகர்வு — அவ்வளவுதான், பில் இந்த எண்ணிலிருந்தே உருவாக வேண்டும்.`,
  },
  cards: {
    calc: { t: { en: 'Work out what that should cost', hi: 'इसकी कीमत कितनी बनती है', mr: 'याची किंमत किती होते', ta: 'இதன் விலை என்ன' },
            d: { en: "Enter the units and your load for an itemised, slab-wise estimate on your DISCOM's real rates",
                 hi: 'यूनिट और लोड डालिए और अपने डिस्कॉम की असली दरों पर स्लैब-वार, मद-वार अनुमान पाइए',
                 mr: 'युनिट आणि लोड टाका आणि तुमच्या डिस्कॉमच्या खऱ्या दरांवर स्लॅबनिहाय अंदाज मिळवा',
                 ta: 'யூனிட், லோட் உள்ளிட்டு உங்கள் DISCOM கட்டணத்தில் ஸ்லாப் வாரியான மதிப்பீடு பெறுங்கள்' } },
    check: { t: { en: 'Check the bill you were sent', hi: 'आपको मिला बिल जाँचिए', mr: 'तुम्हाला आलेले बिल तपासा', ta: 'வந்த பில்லைச் சரிபாருங்கள்' },
             d: { en: 'Upload it and have every charge line checked against the tariff order',
                  hi: 'अपलोड कीजिए और हर चार्ज को टैरिफ ऑर्डर से मिलाकर जँचवाइए',
                  mr: 'अपलोड करा आणि प्रत्येक शुल्क टॅरिफ ऑर्डरशी पडताळून घ्या',
                  ta: 'பதிவேற்றி ஒவ்வொரு கட்டணத்தையும் கட்டண ஆணையுடன் சரிபாருங்கள்' } },
    recharge: { t: { en: 'Recharge and balance, by DISCOM', hi: 'रिचार्ज और बैलेंस, डिस्कॉम के अनुसार', mr: 'रिचार्ज आणि बॅलन्स, डिस्कॉमनुसार', ta: 'ரீசார்ஜ், பேலன்ஸ் — DISCOM வாரியாக' },
                d: { en: 'The official channel, and roughly how many units a recharge buys on your tariff',
                     hi: 'आधिकारिक तरीका, और आपके टैरिफ पर रिचार्ज से लगभग कितनी यूनिट मिलती हैं',
                     mr: 'अधिकृत मार्ग, आणि तुमच्या दरात रिचार्जने अंदाजे किती युनिट मिळतात',
                     ta: 'அதிகாரப்பூர்வ வழி, உங்கள் கட்டணத்தில் ரீசார்ஜ் தரும் தோராயமான யூனிட்' } },
  },
  wrongH2: {
    en: 'When the display is telling you something is wrong',
    hi: 'जब डिस्प्ले बता रहा हो कि कुछ गड़बड़ है',
    mr: 'जेव्हा डिस्प्ले काहीतरी बिघडल्याचे सांगतो',
    ta: 'டிஸ்ப்ளே ஏதோ தவறு என்று சொல்லும்போது',
  },
  wrongCards: [
    { href: '%GUIDES%smart-meter-running-fast/',
      t: { en: 'Meter looks like it is running fast', hi: 'लगता है मीटर तेज़ चल रहा है', mr: 'मीटर वेगात चालल्यासारखे वाटते', ta: 'மீட்டர் வேகமாக ஓடுவதுபோல் தெரிகிறது' },
      d: { en: 'How to test it against a known load before you pay for a meter-testing request',
           hi: 'मीटर टेस्टिंग के लिए पैसे देने से पहले ज्ञात लोड पर इसे कैसे जाँचें',
           mr: 'मीटर टेस्टिंगसाठी पैसे भरण्यापूर्वी ज्ञात लोडवर ते कसे तपासावे',
           ta: 'மீட்டர் சோதனைக்குப் பணம் செலுத்தும் முன் அறியப்பட்ட லோடில் சோதிப்பது எப்படி' } },
    { href: '%GUIDES%smart-meter-recharge-failed/',
      t: { en: 'Recharged, but the balance did not update', hi: 'रिचार्ज किया, पर बैलेंस अपडेट नहीं हुआ', mr: 'रिचार्ज केले, पण बॅलन्स अपडेट झाला नाही', ta: 'ரீசார்ஜ் செய்தும் பேலன்ஸ் மாறவில்லை' },
      d: { en: 'Why the money is almost never lost, and how long the meter really takes to sync',
           hi: 'पैसा लगभग कभी नहीं डूबता — और मीटर को सिंक होने में असल में कितना समय लगता है',
           mr: 'पैसे जवळपास कधीच बुडत नाहीत — आणि मीटरला सिंक व्हायला खरोखर किती वेळ लागतो',
           ta: 'பணம் கிட்டத்தட்ட இழக்கப்படுவதில்லை — மீட்டர் ஒத்திசைய உண்மையில் எவ்வளவு நேரம்' } },
    { href: '%GUIDES%smart-meter-prepaid-disconnection/',
      t: { en: 'Supply cut with balance still showing', hi: 'बैलेंस दिखते हुए भी सप्लाई कट गई', mr: 'बॅलन्स दिसत असूनही पुरवठा बंद', ta: 'பேலன்ஸ் இருந்தும் மின்சாரம் துண்டிப்பு' },
      d: { en: 'Load-limit trips, night-hour protections and what the rules actually require',
           hi: 'लोड-लिमिट ट्रिप, रात के घंटों की सुरक्षा और नियम असल में क्या कहते हैं',
           mr: 'लोड-लिमिट ट्रिप, रात्रीच्या वेळेचे संरक्षण आणि नियम खरोखर काय सांगतात',
           ta: 'லோட்-லிமிட் டிரிப், இரவு நேரப் பாதுகாப்பு, விதிகள் உண்மையில் என்ன கூறுகின்றன' } },
    { href: '%GUIDES%smart-meter-balance-check/',
      t: { en: 'Checking balance without the meter', hi: 'मीटर के बिना बैलेंस देखना', mr: 'मीटरशिवाय बॅलन्स पाहणे', ta: 'மீட்டர் இல்லாமல் பேலன்ஸ் பார்ப்பது' },
      d: { en: 'App, SMS and portal routes when the display is unreachable or unreadable',
           hi: 'जब डिस्प्ले तक पहुँच न हो या पढ़ा न जा सके — ऐप, SMS और पोर्टल के रास्ते',
           mr: 'डिस्प्लेपर्यंत पोहोचता येत नसेल किंवा वाचता येत नसेल — ॲप, SMS आणि पोर्टलचे मार्ग',
           ta: 'டிஸ்ப்ளே எட்டாத அல்லது படிக்க முடியாத நிலையில் — ஆப், SMS, போர்ட்டல் வழிகள்' } },
  ],

  // ── FAQ ───────────────────────────────────────────────────────────────────
  faqH2: { en: 'Common questions', hi: 'आम सवाल', mr: 'सामान्य प्रश्न', ta: 'பொதுவான கேள்விகள்' },
  faq: [
    { q: { en: 'Why is the red light on my smart meter blinking?',
           hi: 'मेरे स्मार्ट मीटर की लाल बत्ती क्यों जल-बुझ रही है?',
           mr: 'माझ्या स्मार्ट मीटरचा लाल दिवा का लुकलुकतो?',
           ta: 'என் ஸ்மார்ட் மீட்டரின் சிவப்பு விளக்கு ஏன் சிமிட்டுகிறது?' },
      a: { en: `That is normal — it is the pulse LED, and it flashes once per unit of energy measured
                (usually 1000 or 3200 flashes per kWh, printed next to it). It is a live load
                indicator, not a fault light: the more you are drawing right now, the faster it
                blinks. Switch everything off and it should slow almost to a stop.`,
           hi: `यह सामान्य है — यह पल्स LED है, जो मापी गई हर इकाई ऊर्जा पर एक बार चमकती है (आम तौर पर 1000
                या 3200 फ्लैश प्रति kWh, जो उसके पास लिखा होता है)। यह खराबी की बत्ती नहीं, सीधे लोड बताती
                है: अभी जितनी बिजली खिंच रही है, उतनी तेज़ चमकेगी। सब बंद कर दीजिए तो यह लगभग रुक जाएगी।`,
           mr: `हे सामान्य आहे — हा पल्स LED आहे, जो मोजलेल्या प्रत्येक युनिट ऊर्जेवर एकदा चमकतो (सामान्यतः
                1000 किंवा 3200 फ्लॅश प्रति kWh, जे शेजारी लिहिलेले असते). हा बिघाडाचा दिवा नाही, थेट लोड
                दर्शवतो: आत्ता जितकी वीज वापरली जाते तितका वेगाने लुकलुकतो. सर्व बंद केल्यास तो जवळपास थांबतो.`,
           ta: `இது இயல்பானது — இது பல்ஸ் LED, அளக்கப்படும் ஒவ்வொரு யூனிட் ஆற்றலுக்கும் ஒருமுறை ஒளிரும்
                (பொதுவாக kWh-க்கு 1000 அல்லது 3200, அருகிலேயே அச்சிடப்பட்டிருக்கும்). இது கோளாறு விளக்கு
                அல்ல, நேரடி லோட் காட்டி: இப்போது அதிக மின்சாரம் எடுத்தால் வேகமாகச் சிமிட்டும். அனைத்தையும்
                அணைத்தால் கிட்டத்தட்ட நின்றுவிடும்.` } },
    { q: { en: 'I recharged but my smart meter balance has not updated — is my money lost?',
           hi: 'रिचार्ज कर दिया पर स्मार्ट मीटर का बैलेंस नहीं बढ़ा — क्या पैसे डूब गए?',
           mr: 'रिचार्ज केले पण स्मार्ट मीटरचा बॅलन्स वाढला नाही — पैसे बुडाले का?',
           ta: 'ரீசார்ஜ் செய்தும் பேலன்ஸ் மாறவில்லை — பணம் போய்விட்டதா?' },
      a: { en: `Almost never. The payment reaches the DISCOM instantly, but the token has to travel to
                the meter over the network, and a weak signal delays that — minutes usually,
                occasionally hours. Your balance keeps depleting normally in the meantime, so the
                credit is not missing, just not yet delivered. Keep the transaction ID.`,
           hi: `लगभग कभी नहीं। भुगतान डिस्कॉम तक तुरंत पहुँच जाता है, लेकिन टोकन को नेटवर्क से होकर मीटर तक
                जाना होता है, और सिग्नल कमज़ोर हो तो देर लगती है — आम तौर पर कुछ मिनट, कभी-कभी घंटे। इस बीच
                आपका बैलेंस सामान्य रूप से घटता रहता है, यानी क्रेडिट गया नहीं, बस अभी पहुँचा नहीं। ट्रांज़ैक्शन
                ID संभालकर रखिए।`,
           mr: `जवळपास कधीच नाही. पैसे डिस्कॉमपर्यंत लगेच पोहोचतात, पण टोकनला नेटवर्कमधून मीटरपर्यंत जावे
                लागते, आणि सिग्नल कमकुवत असल्यास उशीर होतो — सहसा काही मिनिटे, कधी तास. दरम्यान तुमचा
                बॅलन्स नेहमीप्रमाणे कमी होत राहतो, म्हणजे क्रेडिट हरवलेले नाही, फक्त अजून पोहोचलेले नाही.
                ट्रान्झॅक्शन ID जपून ठेवा.`,
           ta: `கிட்டத்தட்ட ஒருபோதும் இல்லை. பணம் உடனே DISCOM-ஐ அடையும், ஆனால் டோக்கன் நெட்வொர்க் வழியாக
                மீட்டரை அடைய வேண்டும், சிக்னல் பலவீனமாக இருந்தால் தாமதமாகும் — பொதுவாக நிமிடங்கள், சில
                சமயம் மணிநேரம். இதற்கிடையில் பேலன்ஸ் வழக்கம்போல் குறையும், அதாவது தொகை தொலையவில்லை,
                இன்னும் சேரவில்லை. பரிவர்த்தனை ID-ஐ வைத்திருங்கள்.` } },
    { q: { en: 'My supply was cut but the meter still shows a balance. Why?',
           hi: 'बैलेंस दिख रहा है फिर भी बिजली कट गई। क्यों?',
           mr: 'बॅलन्स दिसत असूनही वीज गेली. का?',
           ta: 'பேலன்ஸ் இருந்தும் மின்சாரம் துண்டிக்கப்பட்டது. ஏன்?' },
      a: { en: `Usually a load-limit trip rather than a credit problem: drawing more than your
                sanctioned load opens the relay even with money on the meter. Reduce the load and
                most meters reconnect on their own or after a button press. It can also be a remote
                disconnection for a separate arrear.`,
           hi: `आम तौर पर यह बैलेंस की नहीं, लोड-लिमिट की बात होती है: स्वीकृत लोड से ज़्यादा खींचने पर मीटर
                में पैसे होते हुए भी रिले खुल जाता है। लोड घटाइए — ज़्यादातर मीटर खुद या बटन दबाने पर वापस जुड़
                जाते हैं। यह किसी अलग बकाया के कारण दूर से की गई कटौती भी हो सकती है।`,
           mr: `सहसा हा बॅलन्सचा नव्हे तर लोड-लिमिटचा प्रश्न असतो: मंजूर लोडपेक्षा जास्त वीज ओढल्यास मीटरमध्ये
                पैसे असूनही रिले उघडतो. लोड कमी करा — बहुतेक मीटर आपोआप किंवा बटण दाबल्यावर पुन्हा जोडले
                जातात. हा वेगळ्या थकबाकीमुळे दूरवरून केलेला खंडही असू शकतो.`,
           ta: `பொதுவாக இது பேலன்ஸ் பிரச்சினை அல்ல, லோட்-லிமிட்: அனுமதிக்கப்பட்ட லோட்டைவிட அதிகமாக எடுத்தால்
                மீட்டரில் பணம் இருந்தாலும் ரிலே திறக்கும். லோட்டைக் குறையுங்கள் — பெரும்பாலான மீட்டர்கள்
                தானாகவோ பொத்தானை அழுத்தியவுடனோ மீண்டும் இணையும். வேறு நிலுவைத் தொகைக்காக தொலைவிலிருந்து
                துண்டித்திருக்கவும் கூடும்.` } },
    { q: { en: 'Which number on the display is my actual meter reading?',
           hi: 'डिस्प्ले पर कौन-सी संख्या मेरी असली मीटर रीडिंग है?',
           mr: 'डिस्प्लेवरील कोणता आकडा माझे खरे मीटर रीडिंग आहे?',
           ta: 'டிஸ்ப்ளேயில் எந்த எண் என் உண்மையான மீட்டர் ரீடிங்?' },
      a: { en: `The one shown against register code <code>1.8.0</code> — total active energy imported,
                in kWh. The display cycles through several values, so the largest number is not
                always the reading; check the small code beside it.`,
           hi: `वह जो रजिस्टर कोड <code>1.8.0</code> के साथ दिखे — कुल ली गई सक्रिय ऊर्जा, kWh में। डिस्प्ले
                कई मान बारी-बारी दिखाता है, इसलिए सबसे बड़ी संख्या हमेशा रीडिंग नहीं होती; उसके पास लिखा छोटा
                कोड देखिए।`,
           mr: `जो रजिस्टर कोड <code>1.8.0</code> सोबत दिसतो तो — एकूण घेतलेली सक्रिय ऊर्जा, kWh मध्ये.
                डिस्प्ले अनेक मूल्ये आळीपाळीने दाखवतो, त्यामुळे सर्वात मोठा आकडा नेहमीच रीडिंग नसतो;
                शेजारचा छोटा कोड पाहा.`,
           ta: `ரெஜிஸ்டர் குறியீடு <code>1.8.0</code> உடன் காட்டப்படுவது — மொத்த இறக்குமதி ஆற்றல், kWh-ல்.
                டிஸ்ப்ளே பல மதிப்புகளை மாற்றிக் காட்டும், எனவே பெரிய எண் எப்போதும் ரீடிங் அல்ல; அருகில்
                உள்ள சிறிய குறியீட்டைப் பாருங்கள்.` } },
    { q: { en: 'What does the magnet or tamper symbol mean?',
           hi: 'मैग्नेट या टैम्पर वाले चिह्न का क्या मतलब है?',
           mr: 'मॅग्नेट किंवा टॅम्पर चिन्हाचा अर्थ काय?',
           ta: 'காந்தம் அல்லது டேம்பர் சின்னத்தின் பொருள் என்ன?' },
      a: { en: `The meter has detected a strong external magnetic field, a removed terminal cover, or
                a reversed connection, and has logged it with a timestamp and reported it to the
                DISCOM. It does not clear by itself. If it appeared without anyone touching the
                meter, raise a complaint straight away — the timestamped log is the evidence.`,
           hi: `मीटर ने बाहर से तेज़ चुंबकीय क्षेत्र, हटा हुआ टर्मिनल कवर, या उल्टा कनेक्शन पकड़ा है, और उसे
                समय के साथ दर्ज करके डिस्कॉम को भेज दिया है। यह अपने आप नहीं हटता। किसी ने मीटर छुआ न हो और
                यह दिखे, तो तुरंत शिकायत कीजिए — समय के साथ दर्ज वही रिकॉर्ड सबूत है।`,
           mr: `मीटरने बाहेरून तीव्र चुंबकीय क्षेत्र, काढलेले टर्मिनल कव्हर किंवा उलटे कनेक्शन ओळखले आहे, आणि
                ते वेळेसह नोंदवून डिस्कॉमला पाठवले आहे. हे आपोआप जात नाही. कोणी मीटरला हात लावला नसताना हे
                दिसले तर लगेच तक्रार करा — वेळेसह नोंदलेला तोच रेकॉर्ड पुरावा असतो.`,
           ta: `மீட்டர் வெளிப்புற வலுவான காந்தப் புலம், அகற்றப்பட்ட டெர்மினல் மூடி, அல்லது தலைகீழ் இணைப்பைக்
                கண்டறிந்து, நேரத்துடன் பதிவுசெய்து DISCOM-க்கு அனுப்பியுள்ளது. இது தானாக நீங்காது. யாரும்
                மீட்டரைத் தொடாமல் இது தோன்றினால் உடனே புகார் அளியுங்கள் — அந்தப் பதிவே ஆதாரம்.` } },
    { q: { en: 'Is my smart meter running faster than my old meter?',
           hi: 'क्या मेरा स्मार्ट मीटर पुराने मीटर से तेज़ चल रहा है?',
           mr: 'माझा स्मार्ट मीटर जुन्या मीटरपेक्षा वेगात चालतो का?',
           ta: 'என் ஸ்மார்ட் மீட்டர் பழைய மீட்டரைவிட வேகமாக ஓடுகிறதா?' },
      a: { en: `Usually it is not the meter. Old electromechanical meters commonly under-recorded as
                they aged, so an accurate new meter reads higher for the same usage, and prepaid
                billing makes the cost visible daily rather than monthly. Smart meters are tested to
                IS 16444 Class 1.0, meaning ±1% accuracy.`,
           hi: `आम तौर पर गलती मीटर की नहीं होती। पुराने इलेक्ट्रोमैकेनिकल मीटर उम्र के साथ कम दर्ज करने लगते
                थे, इसलिए उतनी ही खपत पर सही नया मीटर ज़्यादा दिखाता है; और प्रीपेड बिलिंग में खर्च महीने के
                बजाय रोज़ दिखता है। स्मार्ट मीटर IS 16444 क्लास 1.0 पर जाँचे जाते हैं, यानी ±1% सटीकता।`,
           mr: `सहसा दोष मीटरचा नसतो. जुने इलेक्ट्रोमेकॅनिकल मीटर वयानुसार कमी नोंदवू लागत, त्यामुळे तेवढ्याच
                वापरावर अचूक नवा मीटर जास्त दाखवतो; आणि प्रीपेड बिलिंगमध्ये खर्च महिन्याऐवजी रोज दिसतो.
                स्मार्ट मीटर IS 16444 क्लास 1.0 वर तपासले जातात, म्हणजे ±1% अचूकता.`,
           ta: `பொதுவாக தவறு மீட்டரில் இல்லை. பழைய மின்னியந்திர மீட்டர்கள் காலப்போக்கில் குறைவாகப் பதிவு
                செய்யத் தொடங்கின, எனவே அதே நுகர்வுக்கு துல்லியமான புதிய மீட்டர் அதிகமாகக் காட்டும்;
                ப்ரீபெய்டில் செலவு மாதத்திற்குப் பதிலாக தினமும் தெரியும். ஸ்மார்ட் மீட்டர்கள் IS 16444
                கிளாஸ் 1.0 படி சோதிக்கப்படுகின்றன, அதாவது ±1% துல்லியம்.` } },
  ],
  disclaimer: {
    en: `Symbol meanings above follow IS 16444 and the OBIS register scheme of IEC 62056-61, which
         Indian smart meters are built to. Icon shapes, display order and the labels used for
         prepaid balance vary between manufacturers — check the leaflet supplied with your meter
         where a symbol on your unit does not match the diagram. Always verify a disputed reading
         against your printed bill and your DISCOM's tariff order.`,
    hi: `ऊपर दिए चिह्नों के अर्थ IS 16444 और IEC 62056-61 की OBIS रजिस्टर व्यवस्था के अनुसार हैं, जिन पर भारतीय
         स्मार्ट मीटर बनते हैं। आइकन की बनावट, डिस्प्ले का क्रम और प्रीपेड बैलेंस के लेबल कंपनी के अनुसार बदलते
         हैं — आपके मीटर का कोई चिह्न चित्र से मेल न खाए तो मीटर के साथ मिली पुस्तिका देखिए। विवाद की स्थिति में
         रीडिंग को हमेशा अपने छपे बिल और डिस्कॉम के टैरिफ ऑर्डर से मिलाइए।`,
    mr: `वरील चिन्हांचे अर्थ IS 16444 आणि IEC 62056-61 च्या OBIS रजिस्टर पद्धतीनुसार आहेत, ज्यांवर भारतीय
         स्मार्ट मीटर बनवले जातात. आयकॉनची रचना, डिस्प्लेचा क्रम आणि प्रीपेड बॅलन्सची लेबले कंपनीनुसार बदलतात —
         तुमच्या मीटरवरील चिन्ह चित्राशी जुळत नसेल तर मीटरसोबत आलेली पुस्तिका पाहा. वादाच्या वेळी रीडिंग नेहमी
         तुमच्या छापील बिलाशी आणि डिस्कॉमच्या टॅरिफ ऑर्डरशी पडताळा.`,
    ta: `மேலே உள்ள சின்னங்களின் பொருள் IS 16444 மற்றும் IEC 62056-61-இன் OBIS ரெஜிஸ்டர் முறைப்படி, இந்திய
         ஸ்மார்ட் மீட்டர்கள் அவற்றின்படியே கட்டப்படுகின்றன. ஐகான் வடிவம், டிஸ்ப்ளே வரிசை, ப்ரீபெய்டு
         பேலன்ஸ் லேபிள் ஆகியவை நிறுவனத்துக்கேற்ப மாறும் — உங்கள் மீட்டரின் சின்னம் படத்துடன் பொருந்தாவிட்டால்
         மீட்டருடன் வந்த கையேட்டைப் பாருங்கள். தகராறு எழும்போது ரீடிங்கை உங்கள் அச்சிட்ட பில்லுடனும் DISCOM
         கட்டண ஆணையுடனும் சரிபாருங்கள்.`,
  },
};
