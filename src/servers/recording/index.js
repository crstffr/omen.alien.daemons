
import samples from '../../common/data/samples';

samples.find({}, (err, samples) => {
    console.log(samples);
});