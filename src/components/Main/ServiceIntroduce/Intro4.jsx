import intro4Img from '@/assets/images/main/intro4_img.svg';

export default function Intro4() {
  return (
    <div className="absolute inset-0 bg-white">
      <img src={intro4Img} alt="" className="absolute left-1/2 top-60 w-3/5 -translate-x-1/2" />
    </div>
  );
}
