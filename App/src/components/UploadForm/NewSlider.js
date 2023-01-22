import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

function NewSlider() {
    const createSliderWithTooltip = Slider.createSliderWithTooltip;

    return (
        createSliderWithTooltip
    );
}

export default NewSlider;