// A small original identity built with CSS + typography — no image asset.
const Logo = ({ size = 'md' }) => {
  const fontSize = size === 'lg' ? '1.3rem' : '1.05rem';

  return (
    <div className="brand" style={{ fontSize }}>
      <span className="brand__mark" aria-hidden="true">
        PT
      </span>
      <span>
        <span className="brand__name-primary">Placement</span>
        <span className="brand__name-accent">Track</span>
        <span className="brand__name-primary"> Pro</span>
      </span>
    </div>
  );
};

export default Logo;
