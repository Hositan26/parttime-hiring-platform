import React from 'react';
import { Heart, Coffee, MapPin, Users, Clock, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import styles from './JobCard.module.css';

interface JobCardProps {
  id: number;
  title: string;
  store: string;
  location: string;
  salary: string;
  shifts: string[];
  headcount: number;
  date: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  id, title, store, location, salary, shifts, headcount, date
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Coffee size={20} className={styles.iconPrimary} />
        </div>
        <div className={styles.statusBadge}>ĐANG TUYỂN</div>
        <button className={styles.favoriteBtn}>
          <Heart size={18} />
        </button>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.store}>{store}</p>
        
        <div className={styles.salaryBox}>
          <Banknote size={16} className={styles.iconGray} />
          <div>
            <span className={styles.label}>Mức lương</span>
            <p className={styles.salary}>{salary}</p>
          </div>
        </div>

        <div className={styles.shiftsBox}>
          <span className={styles.label}>CA LÀM NỔI BẬT</span>
          <div className={styles.shiftTags}>
            <span className={styles.shiftTag}>
              <Clock size={14} /> {shifts[0]}
            </span>
            {shifts.length > 1 && (
              <span className={styles.extraShifts}>+{shifts.length - 1} ca khác</span>
            )}
          </div>
        </div>

        <div className={styles.infoRow}>
          <MapPin size={14} className={styles.iconGray} />
          <span>{location}</span>
        </div>
        <div className={styles.infoRow}>
          <Users size={14} className={styles.iconGray} />
          <span>Cần tuyển: <strong>{headcount} người</strong></span>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.date}>🕒 {date}</span>
        <Button size="sm" onClick={() => navigate(`/jobs/${id}`)}>Xem chi tiết &gt;</Button>
      </div>
    </div>
  );
};
