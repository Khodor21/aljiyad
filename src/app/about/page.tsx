"use client";

import { BookOpen, Star, Award, CalendarDays, Quote } from "lucide-react";

export default function AboutPage() {
  const highlights = [
    {
      icon: Star,
      title: "أفضل أيام الدنيا",
      text: 'قال النبي صلى الله عليه وسلم: "ما من أيام العمل الصالح فيهن أحب إلى الله من هذه الأيام العشر"',
    },
    {
      icon: BookOpen,
      title: "التكبير والتهليل",
      text: "يُسنّ الإكثار من التكبير والتهليل والتسبيح في هذه الأيام",
    },
    {
      icon: Award,
      title: "صيام يوم عرفة",
      text: "صيام يوم عرفة يُكفّر السنة التي قبلها والسنة التي بعدها",
    },
    {
      icon: CalendarDays,
      title: "عشر مباركات",
      text: "تشمل هذه الأيام يوم عرفة ويوم النحر وهما من أعظم الأيام عند الله",
    },
  ];

  const tips = [
    "الإكثار من ذكر الله: التكبير، التهليل، التسبيح، الاستغفار",
    "المحافظة على الصلوات الخمس في جماعة",
    "صيام التسعة الأيام الأولى من ذي الحجة",
    "الإكثار من تلاوة القرآن الكريم بتدبر",
    "التصدق وبذل المعروف للناس",
    "صلة الأرحام والإحسان إلى الجيران",
    "الدعاء والإلحاح على الله في هذه الأيام",
    "الإكثار من الصلاة على النبي صلى الله عليه وسلم",
    "تجنب المعاصي والمنكرات تمامًا",
    "الاجتهاد في قيام الليل ولو بركعتين",
  ];

  return (
    <div className="min-h-screen islamic-pattern-dark">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* الترويسة */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">
            حول <span className="gold-gradient-text">تحدي العشر الأوائل</span>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-lg mx-auto">
            تحدي يومي لمدة عشرة أيام يستهدف استغلال أفضل أيام الدنيا عند الله عز
            وجل
          </p>
        </div>
        {/* الحديث */}
        <div
          className="card p-6 mb-8 animate-fade-in-up relative overflow-hidden"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="absolute top-4 right-4 text-gold/10">
            <Quote size={60} />
          </div>
          <div className="relative z-10">
            <p className="text-white/90 text-lg leading-loose font-semibold mb-3">
              "ما من أيام العمل الصالح فيهن أحب إلى الله من هذه الأيام العشر"
            </p>
            <p className="text-white/40 text-sm">رواه البخاري</p>
            <p className="text-white/70 text-sm leading-relaxed mt-4">
              قالوا: ولا الجهاد؟ قال: "ولا الجهاد، إلا رجل خرج يخاطر بنفسه وماله
              فلم يرجع بشيء"
            </p>
          </div>
        </div>
        /* أبرز المميزات */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-gold-light" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* نصائح */}
        <div
          className="card p-6 mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star size={18} className="text-gold" />
            نصائح لاستغلال العشر
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-gold-light">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
        {/* كيف يعمل التحدي */}
        <div
          className="card p-6 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <h2 className="text-lg font-bold text-white mb-4">
            كيف يعمل التحدي؟
          </h2>
          <div className="space-y-4">
            {[
              {
                step: "١",
                text: "يفتح يوم جديد كل يوم من أيام العشر الأوائل من ذي الحجة",
              },
              { step: "٢", text: "كل يوم يحتوي على مهام متنوعة بنقاط مختلفة" },
              { step: "٣", text: "أكمل المهام خلال اليوم واحصل على النقاط" },
              { step: "٤", text: "اجمع الأوسمة عند تحقيق إنجازات معينة" },
              {
                step: "٥",
                text: "تنافس مع المتحدين الآخرين في لوحة المتصدرين",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed pt-1">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
