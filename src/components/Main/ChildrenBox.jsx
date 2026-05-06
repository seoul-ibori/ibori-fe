import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import ChildrenNameBox from '@/components/common/ChildrenNameBox';

export default function ChildrenBox({ name, imageUrl, labelColor = '#5AA7FF', selected = false }) {
  return (
    <div className="flex flex-col items-center gap-1.25">
      <ChildrenImgBox imageUrl={imageUrl} labelColor={labelColor} selected={selected} />
      <ChildrenNameBox name={name} labelColor={labelColor} />
    </div>
  );
}
