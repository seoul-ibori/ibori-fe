import intro2Img from '@/assets/images/main/intro2_img.svg';

export default function Intro2() {
  return (
    <div className="absolute inset-0 bg-white">
      <img src={intro2Img} alt="" className="absolute bottom-0 left-0 w-full" />
    </div>
  );
}
